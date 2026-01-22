import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const missionId = searchParams.get('missionId')
        const groupId = searchParams.get('groupId')

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // If filtering by missionId, we need to get travelers through groups
        if (missionId) {
            // First, get all groups from this mission
            const { data: groups, error: groupsError } = await supabase
                .from('grupos')
                .select('id')
                .eq('missao_id', missionId)

            if (groupsError) {
                console.error("Error fetching groups:", groupsError)
                return NextResponse.json({ error: groupsError.message }, { status: 500 })
            }

            const groupIds = groups?.map(g => g.id) || []

            // console.log(`Mission ${missionId} has ${groupIds.length} groups:`, groupIds)

            if (groupIds.length === 0) {
                return NextResponse.json([])
            }

            // Now get all travelers from these groups
            const { data: users, error } = await supabase
                .from('users')
                .select(`
                    id,
                    nome,
                    email,
                    telefone,
                    foto,
                    tipoUser,
                    "primeiroAcesso",
                    gruposParticipantes!inner (
                        grupo_id,
                        voucher,
                        foiNotificado,
                        grupos!gruposParticipantes_grupo_id_fkey (
                            nome,
                            logo
                        )
                    ),
                    documentos (
                        id,
                        status
                    )
                `)
                .in('gruposParticipantes.grupo_id', groupIds)
                .order('created_at', { ascending: false })

            if (error) {
                console.error("Supabase Error:", error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            // console.log(`Travelers API - missionId: ${missionId}, users found: ${users?.length || 0}`)

            // Map and format the data for the frontend
            const formattedTravelers = users.map((user: any) => {
                const documents = user.documentos || []
                const groupParticipations = user.gruposParticipantes || []

                const pendingDocs = documents.filter((doc: any) => doc.status === 'PENDENTE').length

                // Get group info (taking the first one for simplicity if multiple)
                const firstGroup = groupParticipations.length > 0 ? groupParticipations[0] : null
                const travelerGroupId = firstGroup?.grupo_id || null
                const travelerGroupName = firstGroup?.grupos?.nome || '-'
                const travelerGroupLogo = firstGroup?.grupos?.logo || null
                const voucher = firstGroup?.voucher || '-'

                let status = "Vinculado"
                if (user.primeiroAcesso !== false) {
                    status = "Convidado"
                } else if (pendingDocs > 0) {
                    status = "Documentação pendente"
                }

                return {
                    id: user.id,
                    name: user.nome || 'Sem nome',
                    email: user.email || '-',
                    phone: user.telefone || '-',
                    missions: 1, // They're in this mission
                    documents: documents.length,
                    lastMission: '-', // Not needed for mission-specific view
                    pendingDocs: pendingDocs,
                    photo: user.foto,
                    voucher: voucher,
                    status: status,
                    groupId: travelerGroupId,
                    groupName: travelerGroupName,
                    groupLogo: travelerGroupLogo
                }
            })

            // console.log('Formatted travelers:', formattedTravelers)

            return NextResponse.json(formattedTravelers)
        }

        // Original logic for groupId or no filter
        // Build dynamic select string based on filters
        const selectString = `
            id,
            nome,
            email,
            telefone,
            foto,
            tipoUser,
            "primeiroAcesso",
            missoesParticipantes${missionId ? '!inner' : ''} (
                missoes_id,
                missoesCadastradas (
                    nome_viagem
                )
            ),
            gruposParticipantes${groupId ? '!inner' : ''} (
                grupo_id,
                voucher,
                foiNotificado,
                grupos!gruposParticipantes_grupo_id_fkey (
                    nome
                )
            ),
            documentos (
                id,
                status
            )
        `

        // Base query
        let query = supabase
            .from('users')
            .select(selectString)

        // If no specific group/mission filter, only show general app users
        if (!groupId && !missionId) {
            query = query.contains('tipoUser', ['USER_APP'])
        }

        if (groupId) {
            query = query.eq('gruposParticipantes.grupo_id', groupId)
        } else if (missionId) {
            query = query.eq('missoesParticipantes.missoes_id', missionId)
        }

        const { data: users, error } = await query.order('created_at', { ascending: false })

        if (error) {
            console.error("Supabase Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // console.log(`Travelers API - missionId: ${missionId}, users found: ${users?.length || 0}`)
        // console.log('Raw users data:', JSON.stringify(users, null, 2))

        // Map and format the data for the frontend
        const formattedTravelers = users.map((user: any) => {
            const missions = user.missoesParticipantes || []
            const documents = user.documentos || []
            const groupParticipations = user.gruposParticipantes || []

            const lastMission = missions.length > 0 ? missions[0].missoesCadastradas?.nome_viagem : '-'
            const pendingDocs = documents.filter((doc: any) => doc.status === 'PENDENTE').length
            const voucher = groupParticipations.length > 0 ? groupParticipations[0].voucher : '-'

            // Get group info (taking the first one for simplicity if multiple)
            const firstGroup = groupParticipations.length > 0 ? groupParticipations[0] : null
            const travelerGroupId = firstGroup?.grupo_id || null
            const travelerGroupName = firstGroup?.grupos?.nome || '-'

            let status = "Vinculado"
            if (user.primeiroAcesso !== false) {
                status = "Convidado"
            } else if (pendingDocs > 0) {
                status = "Documentação pendente"
            }

            return {
                id: user.id,
                name: user.nome || 'Sem nome',
                email: user.email || '-',
                phone: user.telefone || '-',
                missions: missions.length,
                documents: documents.length,
                lastMission: lastMission,
                pendingDocs: pendingDocs,
                photo: user.foto,
                voucher: voucher,
                status: status,
                groupId: travelerGroupId,
                groupName: travelerGroupName
            }
        })

        // console.log('Formatted travelers:', formattedTravelers)

        return NextResponse.json(formattedTravelers)
    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { groupId, invites } = body

        if (!groupId || !invites || !Array.isArray(invites)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Get mission ID from group
        const { data: group, error: groupError } = await supabase
            .from('grupos')
            .select('missao_id')
            .eq('id', groupId)
            .single()

        if (groupError || !group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 })
        }

        const missionId = group.missao_id
        const results = []

        for (const invite of invites) {
            if (invite.type === 'email') {
                const email = invite.value.trim().toLowerCase()

                // 1. Find or create user
                let { data: user, error: userError } = await supabase
                    .from('users')
                    .select('id, tipoUser')
                    .eq('email', email)
                    .single()

                if (userError && userError.code !== 'PGRST116') { // PGRST116 is "no rows found"
                    results.push({ value: email, status: 'error', error: userError.message })
                    continue
                }

                let targetUserId: string;

                if (user) {
                    targetUserId = user.id;
                    // Update user to have USER_APP if they don't have it
                    const currentTypes = user.tipoUser || []
                    if (!currentTypes.includes('USER_APP')) {
                        await supabase
                            .from('users')
                            .update({
                                tipoUser: [...currentTypes, 'USER_APP']
                            })
                            .eq('id', user.id)
                    }
                } else {
                    // Invite user via Supabase Auth (Admin API)
                    // This triggers the standard "Invite User" email from Supabase
                    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
                        data: {
                            nome: email.split('@')[0]
                        }
                    })

                    if (authError) {
                        results.push({ value: email, status: 'error', error: authError.message })
                        continue
                    }

                    const { data: newUser, error: createError } = await supabase
                        .from('users')
                        .insert({
                            id: authData.user.id,
                            email: email,
                            tipoUser: ['USER_APP'],
                            nome: email.split('@')[0],
                            created_at: new Date().toISOString()
                        })
                        .select('id')
                        .single()

                    if (createError) {
                        // Cleanup auth user if profile creation fails
                        await supabase.auth.admin.deleteUser(authData.user.id)
                        results.push({ value: email, status: 'error', error: createError.message })
                        continue
                    }
                    targetUserId = newUser.id
                }

                const userId = targetUserId

                // 2. Link to mission
                await supabase
                    .from('missoesParticipantes')
                    .upsert({
                        user_id: userId,
                        missoes_id: missionId,
                        email: email
                    }, { onConflict: 'user_id,missoes_id' })

                // 3. Link to group
                const { error: groupLinkError } = await supabase
                    .from('gruposParticipantes')
                    .upsert({
                        user_id: userId,
                        grupo_id: groupId,
                        email: email,
                        voucher: `VOUCHER-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                        foiNotificado: false
                    }, { onConflict: 'user_id,grupo_id' })

                if (groupLinkError) {
                    results.push({ value: email, status: 'error', error: groupLinkError.message })
                } else {
                    results.push({ value: email, status: 'success' })
                }
            } else {
                // Phone not implemented yet
                results.push({ value: invite.value, status: 'pending', message: 'Phone invites not implemented yet' })
            }
        }

        return NextResponse.json({ success: true, results })
    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
