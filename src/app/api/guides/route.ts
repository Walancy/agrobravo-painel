import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase client
// Don't initialize globally to avoid build-time errors if envs are missing
// const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error("Supabase Config Missing:", {
                urlStartingWith: supabaseUrl?.substring(0, 10),
                keyStartingWith: supabaseKey?.substring(0, 10),
            });
            return NextResponse.json({
                error: 'Configuration Error: Supabase credentials missing on server.',
                debug: {
                    hasUrl: !!supabaseUrl,
                    hasKey: !!supabaseKey
                }
            }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Query users who are guides (have a cargo set)
        const { data: users, error } = await supabase
            .from('users')
            .select(`
                id,
                nome,
                email,
                telefone,
                foto,
                nivel_ingles,
                tipoUser,
                cargo
            `)
            .not('cargo', 'is', null)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Supabase Query Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // For each guide, fetch their latest group/mission participation
        const guidesWithMission = await Promise.all(users.map(async (user: any) => {
            const { data: leaderRecord } = await supabase
                .from('lideresGrupo')
                .select('grupos (nome, data_fim)')
                .eq('lider_id', user.id)
                .limit(1)

            const lastGroup = (leaderRecord as any)?.[0]?.grupos;

            return {
                ...user,
                lastMission: lastGroup?.nome || '-'
            };
        }));

        return NextResponse.json(guidesWithMission)
    } catch (error: any) {
        console.error("Unexpected API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
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

        // 1. Create user in Supabase Auth first (Admin API)
        // This is required because of the foreign key constraint on public.users(id)
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: body.email,
            email_confirm: true,
            user_metadata: { nome: body.name },
            // You might want to generate a random password or send a reset link
            password: Math.random().toString(36).slice(-12)
        })

        if (authError) {
            console.error("Supabase Auth Error:", authError)
            return NextResponse.json({ error: authError.message }, { status: 500 })
        }

        const userId = authData.user.id

        // Map accessLevel to database permissions
        let permissoes: string[] = []
        if (body.accessLevel === 'admin') {
            permissoes = ['TODAS_AS_PERMISSOES']
        } else if (body.accessLevel === 'manager') {
            permissoes = ['GERENCIAR_USUARIOS', 'EDITAR_MISSOES']
        } else if (body.accessLevel === 'viewer') {
            permissoes = []
        }

        // Map frontend fields to database columns
        const userData = {
            id: userId, // Use the ID from Auth
            nome: body.name,
            email: body.email,
            cpf: body.document,
            telefone: body.phone,
            cargo: body.guideType || 'Guia',
            nacionalidade: body.nationality,
            nivel_ingles: body.englishLevel,
            cidade: body.city,
            estado: body.state,
            cep: body.cep,
            rua: body.street,
            bairro: body.neighborhood,
            numero: body.number,
            complemento: body.complement,
            foto: body.photo,
            tipoUser: ['COLABORADOR'], // Default for guides
            permissoes: permissoes,
            idiomas: body.languages ? [body.languages] : [],
            observacoes: body.observations
        }

        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single()

        if (error) {
            console.error("Supabase Insert Error:", error)
            // If public insert fails, we might want to delete the auth user, 
            // but for now let's just return the error.
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Unexpected API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
