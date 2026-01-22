import { createClient } from '@supabase/supabase-js'
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
    const { data: missions, error } = await supabase
        .from('missoes')
        .select('*, criador:users!criado_por(nome)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Enhancement: Fetch data to calculate sums and counts
    try {
        const missionIds = missions.map(m => m.id);

        // Fetch groups
        const { data: groups } = await supabase
            .from('grupos')
            .select('id, missao_id')
            .in('missao_id', missionIds)
            .is('deleted_at', null);

        const groupIds = groups?.map(g => g.id) || [];

        // Fetch events and transactions for these groups
        const [eventsResult, transactionsResult] = await Promise.all([
            supabase.from('eventos').select('*').in('grupo_id', groupIds),
            supabase.from('transacoes_financeiras').select('grupo_id, valor_gasto').neq('status', 'Recusado').in('grupo_id', groupIds)
        ]);

        const events = eventsResult.data || [];
        const transactions = transactionsResult.data || [];

        const enhancedMissions = missions.map(mission => {
            const missionGroups = groups?.filter(g => g.missao_id === mission.id) || [];

            let totalQuotedCost = 0;
            let totalReachedCost = 0;

            missionGroups.forEach(group => {
                const groupEvents = events.filter(e => e.grupo_id === group.id);
                const groupTransactions = transactions.filter(t => t.grupo_id === group.id);

                // Calculate Group Quoted Cost
                const groupsQuoted = groupEvents.reduce((acc, event) => {
                    const priceValue = event.preco || 0;
                    if (!priceValue) return acc;

                    let unitPrice = 0;
                    if (typeof priceValue === 'string') {
                        const priceStr = priceValue.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
                        unitPrice = parseFloat(priceStr) || 0;
                    } else {
                        unitPrice = parseFloat(priceValue as any) || 0;
                    }

                    const passengerCount = (event.tipo === 'flight' || event.tipo === 'Voo') ? (event.passageiros?.length || 1) : 1;
                    return acc + (unitPrice * passengerCount);
                }, 0);

                // Calculate Group Reached Cost
                const groupsReached = groupTransactions.reduce((acc, t) => acc + Number(t.valor_gasto || 0), 0);

                totalQuotedCost += groupsQuoted;
                totalReachedCost += groupsReached;
            });

            return {
                ...mission,
                custo_cotado: totalQuotedCost,
                custo_atingido: totalReachedCost,
                groups_count: missionGroups.length
            }
        });

        return NextResponse.json(enhancedMissions)

    } catch (err) {
        console.error("Error calculating mission stats:", err);
        // Fallback to basic missions if something fails, or return error
        // But usually we want to return what we have. 
        // For now let's just return the basic missions if calculation fails, 
        // maybe with zeros? Or just return error.
        return NextResponse.json(missions);
    }
}


import { createClient as createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    const supabaseServer = await createServerClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    const body = await request.json()

    // Add creator ID if user is authenticated
    if (user) {
        body.criado_por = user.id
    }

    const { data, error } = await supabase
        .from('missoes')
        .insert(body)
        .select()
        .single()

    if (error) {
        console.error("Supabase Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
