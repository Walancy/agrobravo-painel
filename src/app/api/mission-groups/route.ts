import { createClient } from '@supabase/supabase-js'
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
    try {
        const { data: groups, error: groupsError } = await supabase
            .from('grupos')
            .select('*, missoes(nome, logo)')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })

        if (groupsError) {
            return NextResponse.json({ error: groupsError.message }, { status: 500 })
        }

        // Enhancement: Fetch counts and sums for each group
        // To avoid N+1, we fetch all relevant data and aggregate in memory
        const groupIds = groups.map(g => g.id);

        const [participantsData, eventsData, transactionsData, leadersData] = await Promise.all([
            supabase.from('gruposParticipantes').select('grupo_id, user_id').in('grupo_id', groupIds),
            supabase.from('eventos').select('*').in('grupo_id', groupIds),
            supabase.from('transacoes_financeiras').select('grupo_id, valor_gasto').neq('status', 'Recusado').in('grupo_id', groupIds),
            supabase.from('lideresGrupo').select('grupo_id, lider_id').in('grupo_id', groupIds)
        ]);

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const enhancedGroups = groups.map(group => {
            const groupParticipants = participantsData.data?.filter(p => p.grupo_id === group.id) || [];
            const groupEvents = eventsData.data?.filter(e => e.grupo_id === group.id) || [];
            const groupTransactions = transactionsData.data?.filter(t => t.grupo_id === group.id) || [];
            const groupLeaders = leadersData.data?.filter(l => l.grupo_id === group.id) || [];

            // Find Next Event
            const sortedEvents = [...groupEvents].sort((a, b) => {
                const dateCompare = (a.data || '').localeCompare(b.data || '');
                if (dateCompare !== 0) return dateCompare;
                return (a.hora_inicio || '').localeCompare(b.hora_inicio || '');
            });

            const nextEventObj = sortedEvents.find(e => (e.data || '') >= todayStr) || sortedEvents[sortedEvents.length - 1];
            const nextEventFormatted = nextEventObj ? {
                titulo: nextEventObj.titulo || nextEventObj.tipo || 'Evento',
                hora: nextEventObj.hora_inicio ? nextEventObj.hora_inicio.substring(0, 5) : '--:--'
            } : null;

            // Calculate Guides from lideresGrupo
            const guidesCount = groupLeaders.length;

            // Calculate Quoted Cost
            const quotedCost = groupEvents.reduce((acc, event) => {
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

            // Calculate Reached Cost
            const reachedCost = groupTransactions.reduce((acc, t) => acc + Number(t.valor_gasto || 0), 0);

            return {
                ...group,
                participants_count: groupParticipants.length,
                guides_count: guidesCount,
                custo_cotado: quotedCost,
                custo_atingido: reachedCost,
                next_event: nextEventFormatted
            }
        });

        return NextResponse.json(enhancedGroups)
    } catch (error) {
        console.error("Fetch Groups Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const { data, error } = await supabase
            .from('grupos')
            .insert([body])
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
