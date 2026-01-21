import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const { id } = await params

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const { id } = await params
        const body = await request.json()

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
            nome: body.name,
            email: body.email,
            cpf: body.document,
            telefone: body.phone,
            cargo: body.guideType,
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
            permissoes: permissoes,
            idiomas: body.languages ? [body.languages] : [],
            observacoes: body.observations
        }

        const { data, error } = await supabase
            .from('users')
            .update(userData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const { id } = await params

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Guide deleted successfully' })
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
