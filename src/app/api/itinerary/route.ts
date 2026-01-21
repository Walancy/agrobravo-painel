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

        // Fetch ALL events that have participants from this group
        // This includes events created in other groups but with participants from this group
        const { data: events, error: eventsError } = await supabase
            .from('eventos')
            .select('*')
            .order('data', { ascending: true })
            .order('hora_inicio', { ascending: true })

        if (eventsError) {
            console.error('Failed to fetch events:', eventsError.message)
            if (eventsError.code === 'PGRST116' || eventsError.message.includes('does not exist')) {
                return NextResponse.json({ events: [] })
            }
            return NextResponse.json({ error: eventsError.message }, { status: 500 })
        }

        // Fetch travelers from this group to filter events
        const { data: groupTravelers, error: travelersError } = await supabase
            .from('gruposParticipantes')
            .select('user_id')
            .eq('grupo_id', groupId)

        const groupTravelerIds = new Set(groupTravelers?.map(t => t.user_id.toString()) || [])

        // Filter events: show if created by this group OR has participants from this group
        const relevantEvents = (events || []).filter(event => {
            if (event.grupo_id === groupId) return true

            const passengers = event.passageiros || []
            return passengers.some((pId: string | number) => groupTravelerIds.has(pId.toString()))
        })

        // Fetch group information for all unique participant IDs across all relevant events
        const allPassengerIds = new Set<string>()
        relevantEvents.forEach(event => {
            const passengers = event.passageiros || []
            passengers.forEach((pId: string | number) => allPassengerIds.add(pId.toString()))
        })

        // Fetch travelers with their group information
        // Use explicit relationship name to avoid ambiguity (there are 2 FKs to grupos)
        const { data: travelers, error: travelersDataError } = await supabase
            .from('gruposParticipantes')
            .select('user_id, grupo_id, grupos!gruposParticipantes_grupo_id_fkey(id, logo)')
            .in('user_id', Array.from(allPassengerIds))

        if (travelersDataError) {
            console.warn('Failed to fetch traveler group data:', travelersDataError.message)
        }

        // Create a map of traveler ID to group logo
        const travelerGroupMap = new Map<string, { groupId: string, logo: string | null }>()
        travelers?.forEach((traveler: any) => {
            if (traveler.grupos) {
                travelerGroupMap.set(traveler.user_id.toString(), {
                    groupId: traveler.grupo_id,
                    logo: traveler.grupos.logo
                })
            }
        })

        // Debug logging
        console.log('=== ITINERARY API DEBUG ===')
        console.log('Travelers fetched:', travelers?.length || 0)
        console.log('TravelerGroupMap size:', travelerGroupMap.size)
        if (travelers && travelers.length > 0) {
            console.log('Sample traveler data:', travelers[0])
        }

        // Enhance events with group logos based on participants
        const enhancedEvents = relevantEvents.map(event => {
            const passengers = event.passageiros || []
            const groupLogos = new Map<string, string>()

            passengers.forEach((pId: string | number) => {
                const travelerGroup = travelerGroupMap.get(pId.toString())
                if (travelerGroup && travelerGroup.logo) {
                    groupLogos.set(travelerGroup.groupId, travelerGroup.logo)
                }
            })

            const groupLogosArray = Array.from(groupLogos.values())

            // Debug: log events with passengers
            if (passengers.length > 0) {
                console.log('Event:', event.tipo, '| Passengers:', passengers, '| Logos:', groupLogosArray)
            }

            return {
                ...event,
                source: 'eventos',
                groupLogos: groupLogosArray
            }
        })

        // For return events, copy groupLogos from their reference event
        enhancedEvents.forEach(event => {
            if (event.tipo === 'return' && event.evento_referencia_id) {
                const refEvent = enhancedEvents.find(e => e.id === event.evento_referencia_id)
                if (refEvent && refEvent.groupLogos) {
                    event.groupLogos = refEvent.groupLogos
                }
            }
        })

        // Try to fetch group activities (gruposAtividades) - optional
        let activities: any[] = []
        try {
            const { data: activitiesData, error: activitiesError } = await supabase
                .from('gruposAtividades')
                .select('*')
                .eq('grupo_id', groupId)
                .order('data', { ascending: true })
                .order('hora_inicio', { ascending: true })

            if (!activitiesError && activitiesData) {
                activities = activitiesData.map(a => ({ ...a, source: 'gruposAtividades', groupLogos: [] }))
            } else if (activitiesError) {
                console.warn('gruposAtividades table not available or error:', activitiesError.message)
            }
        } catch (activityError) {
            console.warn('Failed to fetch activities (table may not exist):', activityError)
        }

        // Merge events and activities
        const allItems = [...enhancedEvents, ...activities].sort((a, b) => {
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
        console.log('API POST - Body:', JSON.stringify(body, null, 2));

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
        console.log('API PUT - Body:', JSON.stringify(body, null, 2));
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
