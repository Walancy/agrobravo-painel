import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const TABLE_NAME = 'grupos';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const { data: group, error } = await supabase
            .from(TABLE_NAME)
            .select('*, missoes(nome, continente)')
            .eq('id', id)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Parallel targeted fetching for metrics
        const EXCLUDED_TYPES = ['transfer', 'checkout', 'Transfer', 'Checkout', 'Check-out'];

        const [participantsResult, guidesCountResult, activitiesCountResult] = await Promise.all([
            // Get participant IDs for filtering shared events
            supabase.from('gruposParticipantes').select('user_id', { count: 'exact' }).eq('grupo_id', id),
            // Count guides
            supabase.from('lideresGrupo').select('id', { count: 'exact', head: true }).eq('grupo_id', id),
            // Count direct activities (excluding transfers/checkouts)
            supabase.from('gruposAtividades').select('id', { count: 'exact', head: true })
                .eq('grupo_id', id)
                .not('tipo', 'in', `(${EXCLUDED_TYPES.join(',')})`)
        ]);

        const participantIds = participantsResult.data?.map(p => p.user_id?.toString()) || [];

        // Count direct events
        const { count: directEventsCount } = await supabase.from('eventos')
            .select('id', { count: 'exact', head: true })
            .eq('grupo_id', id)
            .not('tipo', 'in', `(${EXCLUDED_TYPES.join(',')})`);

        // shared events count - still need to be careful with JSONB search
        // For performance if there are many events, we should ideally have a join table, 
        // but for now we'll do a slightly better filtered fetch
        let sharedEventsCount = 0;
        if (participantIds.length > 0) {
            const { data: sharedEvents } = await supabase.from('eventos')
                .select('id, passageiros')
                .neq('grupo_id', id)
                .not('tipo', 'in', `(${EXCLUDED_TYPES.join(',')})`)
                .not('passageiros', 'is', null);

            sharedEventsCount = (sharedEvents || []).filter(event => {
                const passengers = event.passageiros || [];
                return passengers.some((pId: any) => participantIds.includes(pId?.toString()));
            }).length;
        }

        const enhancedGroup = {
            ...group,
            participants_count: participantsResult.count || 0,
            guides_count: guidesCountResult.count || 0,
            events_count: (directEventsCount || 0) + (activitiesCountResult.count || 0) + sharedEventsCount
        };

        return NextResponse.json(enhancedGroup)

    } catch (error) {
        console.error("Error in group details API:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(body)
            .eq('id', id)
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        // Implementing Soft Delete as 'deleted_at' column exists in 'grupos'
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)

        if (error) {
            // Fallback to hard delete if update fails or logic requires it, strictly speaking usually hard delete unless specified
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
