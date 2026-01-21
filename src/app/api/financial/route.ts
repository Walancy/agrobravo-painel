
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const groupId = searchParams.get('groupId')

        if (!groupId) {
            return NextResponse.json({ error: 'Missing groupId' }, { status: 400 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // 1. Fetch Group Financial Info
        const { data: group, error: groupError } = await supabase
            .from('grupos')
            .select('orcamento_total, valor_adicionado')
            .eq('id', groupId)
            .single()

        if (groupError) {
            return NextResponse.json({ error: groupError.message }, { status: 500 })
        }

        // 2. Fetch Transactions
        const { data: transactions, error: transError } = await supabase
            .from('transacoes_financeiras')
            .select('*, user:user_id(nome, foto)')
            .eq('grupo_id', groupId)
            .order('created_at', { ascending: false })

        if (transError) {
            return NextResponse.json({ error: transError.message }, { status: 500 })
        }

        // 3. Calculate Totals
        // "Total Spent" KPI: Sum of 'valor_gasto' for all transactions that are NOT 'Recusado'
        const totalSpent = transactions
            .filter((t: any) => t.status !== 'Recusado')
            .reduce((acc: number, t: any) => acc + Number(t.valor_gasto), 0);

        // "Balance": Initial Budget + Added - Reimbursed Amounts
        // Only "Reembolsado" transactions deduct their "valor_faltante" from the balance.
        const totalReimbursed = transactions
            .filter((t: any) => t.status === 'Reembolsado')
            .reduce((acc: number, t: any) => acc + Number(t.valor_faltante), 0);

        const balance = (Number(group.valor_adicionado || 0)) - totalReimbursed;

        // Note: The previous logic might have assumed "totalSpent" reduces balance. 
        // With the new instruction "accepting discounts missing value from balance", the above logic aligns with an "Expense Reimbursement" model.
        // But if there are "Pre-paid" expenses (missing=0), do they affect balance?
        // If missing=0, it means no reimbursement needed. Maybe paid by card?
        // If paid by card (missing=0), the money IS gone from the bank.
        // So we should probably ALSO deduct (spent - missing) if that part was paid by group?
        // Complexity increases. Let's stick to the EXPLICIT instruction: "aceitando, o valor faltante deve descontar o saldo".
        // This implies ONLY valor_faltante affects the balance upon acceptance.

        return NextResponse.json({
            summary: {
                totalBudget: group.orcamento_total || 0,
                totalAdded: group.valor_adicionado || 0,
                currentBalance: balance,
                totalSpent: totalSpent
            },
            transactions: transactions.map((t: any) => ({
                id: t.id,
                category: t.categoria,
                spent: t.valor_gasto,
                missing: t.valor_faltante,
                location: t.local,
                postedBy: t.user?.nome || 'Desconhecido',
                postedByPhoto: t.user?.foto,
                status: t.status,
                reimbursementDate: t.data_reembolso,
                createdAt: t.created_at
            }))
        })

    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const body = await request.json()
        const { type, ...data } = body;

        // type: 'transaction' | 'budget_add'

        if (type === 'budget_add') {
            const { groupId, amount } = data;
            if (!groupId || !amount) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

            // Increment valor_adicionado
            // Note: Parallel requests race condition might occur, but standard update is safer properly?
            // "valor_adicionado = valor_adicionado + amount" is tricky with simple update in JS client without rpc.
            // But we can read first. For now, read-modify-write.

            const { data: group } = await supabase.from('grupos').select('valor_adicionado').eq('id', groupId).single();
            const currentAdded = Number(group?.valor_adicionado || 0);
            const newAdded = currentAdded + Number(amount);

            const { error } = await supabase
                .from('grupos')
                .update({ valor_adicionado: newAdded })
                .eq('id', groupId)

            if (error) throw error;
            return NextResponse.json({ success: true, newTotal: newAdded });
        } else {
            // Transaction
            const { groupId, category, spent, missing, location, userId, status, reimbursementDate } = data;

            const { error } = await supabase
                .from('transacoes_financeiras')
                .insert({
                    grupo_id: groupId,
                    categoria: category,
                    valor_gasto: spent,
                    valor_faltante: missing || 0,
                    local: location,
                    user_id: userId,
                    status: status || 'Pendente',
                    data_reembolso: reimbursementDate
                })

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const body = await request.json()
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const { error } = await supabase
            .from('transacoes_financeiras')
            .update({
                status: status,
                data_reembolso: status === 'Reembolsado' ? new Date().toISOString() : null // Update date if reimbursed
            })
            .eq('id', id)

        if (error) throw error;

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
