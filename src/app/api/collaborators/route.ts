import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Fetch users who are collaborators or masters, excluding guides (who have a cargo)
        const { data: users, error } = await supabase
            .from('users')
            .select(`
                id,
                nome,
                email,
                permissoes,
                created_at,
                deleted_at,
                foto,
                tipoUser,
                cargo,
                quemCriou,
                creator:quemCriou (
                    nome
                )
            `)
            .or('tipoUser.cs.{COLABORADOR},tipoUser.cs.{MASTER}')
            .is('cargo', null)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Supabase Query Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const collaborators = users.map((user: any) => {
            // Map permissions to readable text
            let accessLevel = 'Nenhuma permissão';
            if (user.permissoes?.includes('TODAS_AS_PERMISSOES')) {
                accessLevel = 'Todas as permissões';
            } else if (user.permissoes?.includes('GERENCIAR_USUARIOS')) {
                accessLevel = 'Master';
            } else if (user.permissoes?.length > 0) {
                accessLevel = 'Permissão limitada';
            }

            return {
                id: user.id,
                name: user.nome || 'Sem nome',
                email: user.email || '-',
                accessLevel: accessLevel,
                createdAt: user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-',
                createdBy: user.creator?.nome || '-',
                status: user.deleted_at ? 'Inativo' : 'Ativo',
                photo: user.foto
            };
        });

        return NextResponse.json(collaborators)
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

        // 1. Create user in Supabase Auth first
        // email_confirm: false will send a verification email to the user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: body.email,
            email_confirm: false,
            user_metadata: { nome: body.name },
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
            id: userId,
            nome: body.name,
            email: body.email,
            cpf: body.document,
            telefone: body.phone,
            cidade: body.city,
            estado: body.state,
            cep: body.cep,
            rua: body.street,
            bairro: body.neighborhood,
            numero: body.number,
            complemento: body.complement,
            foto: body.photo,
            tipoUser: ['COLABORADOR'],
            permissoes: permissoes,
            primeiroAcesso: true
        }

        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single()

        if (error) {
            console.error("Supabase Insert Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Unexpected API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
