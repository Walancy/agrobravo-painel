
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const missionId = searchParams.get('missionId')

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        let query = supabase
            .from('notificacoes')
            .select(`
                id,
                titulo,
                mensagem,
                created_at,
                user_id,
                solicitacao_user_id
            `)
            .order('created_at', { ascending: false })

        if (missionId) {
            query = query.eq('missao_id', missionId)
        }

        const { data, error } = await query

        if (error) {
            console.error("Supabase Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Deduplicate Logic
        // We group by (created_at + title + message) to ensure we show unique broadcast events.

        // Collect sender IDs for manual fetch
        const senderIds = Array.from(new Set(data.map((n: any) => n.solicitacao_user_id).filter(Boolean)));
        let sendersMap: Record<string, any> = {};

        if (senderIds.length > 0) {
            const { data: senders } = await supabase
                .from('users')
                .select('id, nome, foto')
                .in('id', senderIds);

            if (senders) {
                senders.forEach((s: any) => {
                    sendersMap[s.id] = s;
                });
            }
        }

        const seenEvents = new Set();
        const notifications: any[] = [];

        data.forEach((n: any) => {
            // Create a unique key for the "Batch"
            const uniqueKey = `${n.created_at}-${n.titulo}-${n.mensagem}`;

            if (!seenEvents.has(uniqueKey)) {
                seenEvents.add(uniqueKey);

                const senderData = n.solicitacao_user_id ? sendersMap[n.solicitacao_user_id] : null;

                notifications.push({
                    id: n.id,
                    // Use created_at as logical Batch ID for deletion
                    postId: n.created_at,
                    sender: senderData?.nome || 'Administração',
                    senderPhoto: senderData?.foto,
                    date: n.created_at,
                    title: n.titulo,
                    description: n.mensagem
                });
            }
        });

        return NextResponse.json(notifications)
    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const createdAt = searchParams.get('createdAt')
        const id = searchParams.get('id') // Fallback for single delete

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        let error;

        if (createdAt) {
            // Batch delete by timestamp
            const { error: delError } = await supabase
                .from('notificacoes')
                .delete()
                .eq('created_at', createdAt)
            error = delError
        } else if (id) {
            const { error: delError } = await supabase
                .from('notificacoes')
                .delete()
                .eq('id', id)
            error = delError
        } else {
            return NextResponse.json({ error: 'Missing ID or PostID' }, { status: 400 })
        }

        if (error) {
            console.error("Supabase Delete Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
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

        const { groupId, title, message, senderId } = body // senderId might be the admin

        if (!groupId || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Get group details to get mission_id
        const { data: group } = await supabase.from('grupos').select('missao_id').eq('id', groupId).single()
        if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

        const missionId = group.missao_id

        // Get all users in the group
        const { data: participants } = await supabase
            .from('gruposParticipantes')
            .select('user_id')
            .eq('grupo_id', groupId)

        if (!participants || participants.length === 0) {
            return NextResponse.json({ message: 'No participants in group to notify', count: 0 })
        }

        const now = new Date().toISOString()

        const notificationsToInsert = participants.map((p: any) => ({
            missao_id: missionId,
            user_id: p.user_id, // The recipient
            titulo: title,
            assunto: title,
            mensagem: message,
            lido: false,
            created_at: now,
            // Store senderId in solicitacao_user_id
            solicitacao_user_id: senderId || null,
        }))

        const { error } = await supabase
            .from('notificacoes')
            .insert(notificationsToInsert)

        if (error) {
            console.error("Supabase Insert Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, count: notificationsToInsert.length })

    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
