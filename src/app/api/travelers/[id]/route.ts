import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 1. Fetch Basic User Details
        const { data: user, error: userError } = await supabase
            .from('users')
            .select(`
                *,
                documentos (*)
            `)
            .eq('id', id)
            .single()

        if (userError) throw userError
        if (!user) return NextResponse.json({ error: 'Traveler not found' }, { status: 404 })

        // 2. Fetch Direct Mission Participation
        const { data: directMissions, error: mpError } = await supabase
            .from('missoesParticipantes')
            .select('missoes_id, created_at')
            .eq('user_id', id)

        if (mpError) console.error("Error fetching missoesParticipantes:", mpError)

        // 3. Fetch Group Participation
        const { data: groupParticipations, error: gpError } = await supabase
            .from('gruposParticipantes')
            .select('grupo_id, created_at')
            .eq('user_id', id)

        if (gpError) console.error("Error fetching gruposParticipantes:", gpError)

        // 4. Fetch Groups Details
        const groupIds = groupParticipations?.map((gp: any) => gp.grupo_id) || []
        let groupsMap = new Map()

        if (groupIds.length > 0) {
            const { data: groups, error: groupsError } = await supabase
                .from('grupos')
                .select('id, nome, logo, missao_id, data_inicio, data_fim, orcamento_total, created_at')
                .in('id', groupIds)

            if (groupsError) console.error("Error fetching groups:", groupsError)

            if (groups) {
                groups.forEach((g: any) => groupsMap.set(g.id, g))
            }
        }

        // 5. Collect all Mission IDs (from direct participation AND from groups)
        const allMissionIds = new Set<string>()

        // From direct participation
        directMissions?.forEach((mp: any) => {
            if (mp.missoes_id) allMissionIds.add(mp.missoes_id)
        })

        // From groups
        Array.from(groupsMap.values()).forEach((g: any) => {
            if (g.missao_id) allMissionIds.add(g.missao_id)
        })

        // 6. Fetch Missions Details
        let missionsMap = new Map()
        if (allMissionIds.size > 0) {
            const { data: missions, error: missionsError } = await supabase
                .from('missoes')
                .select('id, nome, logo, continente, paises, data_inicio, data_fim, custo_cotado, status, documentos_obrigatorios')
                .in('id', Array.from(allMissionIds))

            if (missionsError) console.error("Error fetching missions:", missionsError)

            if (missions) {
                missions.forEach((m: any) => missionsMap.set(m.id, m))
            }
        }

        // ==========================================
        // BUILD THE RESPONSE OBJECT
        // ==========================================

        // Determine "Current/Latest" Context
        // We look for the most relevant mission from both groups and direct participation
        const sortedGroups = Array.from(groupsMap.values()).sort((a: any, b: any) => {
            const dateA = new Date(a.data_inicio || a.created_at || 0).getTime()
            const dateB = new Date(b.data_inicio || b.created_at || 0).getTime()
            return dateB - dateA
        })

        let currentGroup = sortedGroups[0] || null

        // Find latest direct mission participation to compare
        let latestDirectMission = null
        if (directMissions && directMissions.length > 0) {
            const sortedDirect = [...directMissions].sort((a: any, b: any) => {
                // Sort by mission date if possible, else created_at
                const missionA = missionsMap.get(a.missoes_id)
                const missionB = missionsMap.get(b.missoes_id)
                const dateA = new Date(missionA?.data_inicio || a.created_at || 0).getTime()
                const dateB = new Date(missionB?.data_inicio || b.created_at || 0).getTime()
                return dateB - dateA
            })
            if (sortedDirect.length > 0) {
                const mp = sortedDirect[0]
                latestDirectMission = missionsMap.get(mp.missoes_id)
            }
        }

        let currentMission = currentGroup?.missao_id ? missionsMap.get(currentGroup.missao_id) : null

        // If latest direct mission is more recent than current group's mission, use it
        if (latestDirectMission) {
            const groupDate = currentGroup ? new Date(currentGroup.data_inicio || currentGroup.created_at || 0).getTime() : 0
            const directDate = new Date(latestDirectMission.data_inicio || 0).getTime() // Direct mission doesn't have "join date" per se, use mission start

            if (!currentGroup || directDate > groupDate) {
                currentMission = latestDirectMission
                // If the mission is direct, there is no "Current Group" effectively for display context in header
                // unless we want to keep the old group? strictly speaking, if they are on a new mission alone, group should probably be '-'
                if (directDate > groupDate) {
                    currentGroup = null
                }
            }
        }

        const currentMissionId = currentMission?.id

        // Build Mission History List
        const missionHistoryMap = new Map()

        // Add from Direct Participation
        if (directMissions) {
            directMissions.forEach((mp: any) => {
                const mission = missionsMap.get(mp.missoes_id)
                if (mission) {
                    missionHistoryMap.set(mission.id, {
                        id: mission.id,
                        missionName: mission.nome || "Missão sem nome",
                        missionLogo: mission.logo || null,
                        groupName: '-',
                        groupLogo: null,
                        destination: mission.continente || mission.paises?.join(', ') || '-',
                        status: mission.status || 'Planejado',
                        startDate: mission.data_inicio,
                        endDate: mission.data_fim,
                        value: mission.custo_cotado || 0,
                        created_at: mp.created_at
                    })
                }
            })
        }

        // Add/Merge from Group Participation
        if (groupParticipations) {
            groupParticipations.forEach((gp: any) => {
                const group = groupsMap.get(gp.grupo_id)
                if (group && group.missao_id) {
                    const mission = missionsMap.get(group.missao_id)
                    const existing = missionHistoryMap.get(group.missao_id)

                    if (existing) {
                        // Enrich existing entry
                        existing.groupName = group.nome
                        existing.groupLogo = group.logo
                        if (group.data_inicio) existing.startDate = group.data_inicio
                        if (group.data_fim) existing.endDate = group.data_fim
                        existing.value = group.orcamento_total || existing.value
                    } else if (mission) {
                        // Create new entry if it wasn't in direct participation
                        missionHistoryMap.set(mission.id, {
                            id: mission.id,
                            missionName: mission.nome || "Missão sem nome",
                            missionLogo: mission.logo || null,
                            groupName: group.nome,
                            groupLogo: group.logo || null,
                            destination: mission.continente || mission.paises?.join(', ') || '-',
                            status: mission.status || 'Planejado',
                            startDate: group.data_inicio || mission.data_inicio,
                            endDate: group.data_fim || mission.data_fim,
                            value: group.orcamento_total || mission.custo_cotado || 0,
                            created_at: gp.created_at
                        })
                    }
                }
            })
        }

        const missionHistory = Array.from(missionHistoryMap.values()).sort((a: any, b: any) => {
            return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime()
        })


        // Format response
        const formattedTraveler = {
            id: user.id,
            name: user.nome || 'Sem nome',
            email: user.email || '',
            phone: user.telefone || '',
            photo: user.foto,
            groupName: currentGroup?.nome || '-',
            groupLogo: currentGroup?.logo || null,
            missionName: currentMission?.nome || '-',
            country: user.nacionalidade || 'Brasil',
            joinedDate: user.created_at || new Date().toISOString(),
            // TODO: Calculate these from actual data if available, using placeholders for now as per previous logic
            seals: 6,
            connections: 181,
            missions: missionHistory.length,
            visits: 20,

            // Form fields
            birthDate: user.data_nascimento,
            nationality: user.nacionalidade,
            passport: user.passaporte,
            cpf: user.cpf,
            ssn: user.ssn,
            company: user.empresa,
            position: user.cargo,
            dietaryRestrictions: user.restricoes_alimentares || [],
            medicalRestrictions: user.restricoes_medicas || [],
            observations: user.observacoes,
            documents: user.documentos || [],
            requiredDocuments: currentMission?.documentos_obrigatorios || [],
            missionId: currentMissionId,
            groupId: currentGroup?.id,
            missionHistory: missionHistory
        }

        return NextResponse.json(formattedTraveler)
    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Map frontend fields to database columns
        const updateData: any = {}

        if (body.name) updateData.nome = body.name
        if (body.email) updateData.email = body.email
        if (body.phone) updateData.telefone = body.phone
        if (body.birthDate) updateData.data_nascimento = body.birthDate
        if (body.nationality) updateData.nacionalidade = body.nationality
        if (body.passport) updateData.passaporte = body.passport
        if (body.cpf) updateData.cpf = body.cpf
        if (body.ssn) updateData.ssn = body.ssn
        if (body.company) updateData.empresa = body.company
        if (body.position !== undefined) updateData.cargo = body.position
        if (body.dietaryRestrictions) updateData.restricoes_alimentares = body.dietaryRestrictions
        if (body.medicalRestrictions) updateData.restricoes_medicas = body.medicalRestrictions
        if (body.observations !== undefined) updateData.observacoes = body.observations

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error("Supabase Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        const { searchParams } = new URL(request.url)
        const groupId = searchParams.get('groupId')

        let error;

        if (groupId) {
            // Remove from specific group
            const { error: deleteError } = await supabase
                .from('gruposParticipantes')
                .delete()
                .match({ user_id: id, grupo_id: groupId })

            error = deleteError
        } else {
            // Soft delete user (system wide)
            const { error: updateError } = await supabase
                .from('users')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id)

            error = updateError
        }

        if (error) {
            console.error("Supabase Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
