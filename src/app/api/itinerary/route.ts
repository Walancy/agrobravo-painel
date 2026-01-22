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

        // 1. Fetch group travelers first to filter shared events
        const { data: groupTravelers } = await supabase
            .from('gruposParticipantes')
            .select('user_id')
            .eq('grupo_id', groupId)

        const groupTravelerIds = groupTravelers?.map(t => t.user_id.toString()) || []

        // 2. Fetch events: Direct OR containing our travelers
        // First get direct events
        const { data: directEvents } = await supabase
            .from('eventos')
            .select('*')
            .eq('grupo_id', groupId)

        let relevantEvents = directEvents || []

        // Then get potentially shared events (those that have passengers)
        if (groupTravelerIds.length > 0) {
            const { data: sharedEvents } = await supabase
                .from('eventos')
                .select('*')
                .neq('grupo_id', groupId)
                .not('passageiros', 'is', null)

            const filteredShared = (sharedEvents || []).filter(event => {
                const passengers = event.passageiros || []
                return passengers.some((pId: any) => groupTravelerIds.includes(pId.toString()))
            })

            relevantEvents = [...relevantEvents, ...filteredShared]
        }

        // 3. Batch fetch logos for all participants across events
        const allPassengerIds = new Set<string>()
        relevantEvents.forEach(event => {
            const passengers = event.passageiros || []
            passengers.forEach((pId: any) => allPassengerIds.add(pId.toString()))
        })

        const { data: logoData } = await supabase
            .from('gruposParticipantes')
            .select('user_id, grupo_id, grupos!gruposParticipantes_grupo_id_fkey(logo)')
            .in('user_id', Array.from(allPassengerIds))

        const logoMap = new Map<string, string>()
        logoData?.forEach((item: any) => {
            if (item.grupos?.logo) {
                logoMap.set(item.user_id.toString(), item.grupos.logo)
            }
        })

        // 4. Enhance events with unique logos
        const enhancedEvents = relevantEvents.map(event => {
            const passengers = event.passageiros || []
            const groupLogos = new Set<string>()
            passengers.forEach((pId: any) => {
                const logo = logoMap.get(pId.toString())
                if (logo) groupLogos.add(logo)
            })

            return {
                ...event,
                source: 'eventos',
                groupLogos: Array.from(groupLogos)
            }
        })

        // Handle return activity logos
        enhancedEvents.forEach(event => {
            if (event.tipo === 'return' && event.evento_referencia_id) {
                const ref = enhancedEvents.find(e => e.id === event.evento_referencia_id)
                if (ref) event.groupLogos = ref.groupLogos
            }
        })

        // 5. Fetch activities
        const { data: activities } = await supabase
            .from('gruposAtividades')
            .select('*')
            .eq('grupo_id', groupId)

        const allItems = [...enhancedEvents, ...(activities || []).map(a => ({ ...a, source: 'gruposAtividades', groupLogos: [] }))]
            .sort((a, b) => {
                const dateCompare = (a.data || '').localeCompare(b.data || '')
                if (dateCompare !== 0) return dateCompare
                return (a.hora_inicio || '').localeCompare(b.hora_inicio || '')
            })

        return NextResponse.json({ events: allItems })

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
        // console.log('API POST - Body:', JSON.stringify(body, null, 2));

        const { groupId, ...eventData } = body;

        const { data, error } = await supabase
            .from('eventos')
            .insert({
                grupo_id: groupId,
                ...eventData
            })
            .select()
            .single()

        if (error) {
            console.error('API POST - Supabase Error:', error);
            throw error;
        }
        return NextResponse.json({ success: true, event: data });

    } catch (error: any) {
        console.error("API POST Error:", error)
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
        // console.log('API PUT - Body:', JSON.stringify(body, null, 2));
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing event id' }, { status: 400 })
        }

        const { error } = await supabase
            .from('eventos')
            .update(updates)
            .eq('id', id)

        if (error) throw error;
        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing event id' }, { status: 400 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        const { error } = await supabase
            .from('eventos')
            .delete()
            .eq('id', id)

        if (error) throw error;
        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
