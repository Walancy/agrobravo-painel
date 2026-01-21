import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const missionId = searchParams.get('missionId')

    if (!missionId) {
        return NextResponse.json({ error: 'Missing missionId' }, { status: 400 })
    }

    try {
        // Get all groups from this mission
        const { data: groups, error: groupsError } = await supabase
            .from('grupos')
            .select('id')
            .eq('missao_id', missionId)

        if (groupsError) {
            console.error('Error fetching groups:', groupsError)
            return NextResponse.json({ error: groupsError.message }, { status: 500 })
        }

        const groupIds = groups?.map(g => g.id) || []

        if (groupIds.length === 0) {
            return NextResponse.json([])
        }

        // Get all financial transactions from these groups
        const { data: transactions, error: transactionsError } = await supabase
            .from('transacoes_financeiras')
            .select(`
                *,
                grupos:grupo_id (
                    nome,
                    logo
                ),
                user:user_id (
                    nome,
                    foto
                )
            `)
            .in('grupo_id', groupIds)
            .order('created_at', { ascending: false })

        if (transactionsError) {
            console.error('Error fetching transactions:', transactionsError)
            return NextResponse.json({ error: transactionsError.message }, { status: 500 })
        }

        // Format the data
        const formattedExpenses = (transactions || []).map((t: any) => ({
            id: t.id,
            categoria: t.categoria || 'Sem categoria',
            valor_gasto: t.valor_gasto || 0,
            grupo_nome: t.grupos?.nome || 'Sem grupo',
            grupo_logo: t.grupos?.logo || null,
            guia_nome: t.user?.nome || null,
            guia_foto: t.user?.foto || null,
            status: t.status || 'Pendente',
            created_at: t.created_at || new Date().toISOString()
        }))

        return NextResponse.json(formattedExpenses)
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
