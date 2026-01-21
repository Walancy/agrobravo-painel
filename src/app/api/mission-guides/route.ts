import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const missionId = searchParams.get('missionId')
    const groupId = searchParams.get('groupId')

    try {
        let query = supabase
            .from('lideresGrupo')
            .select(`
                lider_id,
                grupo_id,
                users:lider_id (
                    id,
                    nome,
                    email,
                    telefone,
                    foto,
                    nivel_ingles,
                    cargo
                ),
                grupos:grupo_id (
                    id,
                    nome,
                    missao_id
                )
            `)

        // Filter by missionId if provided
        if (missionId) {
            // We need to filter based on the joined table 'grupos'
            // Supabase syntax for filtering on joined tables is usually key.column
            // However, with !inner join it filters the parent rows too
            query = supabase
                .from('lideresGrupo')
                .select(`
                    lider_id,
                    grupo_id,
                    users:lider_id (
                        id,
                        nome,
                        email,
                        telefone,
                    foto,
                    nivel_ingles,
                    cargo
                ),
                    grupos!inner (
                        id,
                        nome,
                        missao_id
                    )
                `)
                .eq('grupos.missao_id', missionId)
        } else if (groupId) {
            query = query.eq('grupo_id', groupId)
        }

        const { data, error } = await query

        if (error) {
            console.error(error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { lider_ids, grupo_id } = body

        if (!lider_ids || !Array.isArray(lider_ids) || !grupo_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const inserts = lider_ids.map((lider_id: string) => ({
            lider_id,
            grupo_id
        }))

        const { data, error } = await supabase
            .from('lideresGrupo')
            .insert(inserts)
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const liderId = searchParams.get('liderId')
        const groupId = searchParams.get('groupId')

        if (!liderId || !groupId) {
            return NextResponse.json({ error: 'Missing liderId or groupId query parameter' }, { status: 400 })
        }

        const { error } = await supabase
            .from('lideresGrupo')
            .delete()
            .eq('lider_id', liderId)
            .eq('grupo_id', groupId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Guide unassigned successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
