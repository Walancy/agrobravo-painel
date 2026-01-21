import { createClient } from '@supabase/supabase-js'
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
    const { data, error } = await supabase
        .from('missoes')
        .select('*, criador:users!criado_por(nome)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}


import { createClient as createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    const supabaseServer = await createServerClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    const body = await request.json()

    // Add creator ID if user is authenticated
    if (user) {
        body.criado_por = user.id
    }

    const { data, error } = await supabase
        .from('missoes')
        .insert(body)
        .select()
        .single()

    if (error) {
        console.error("Supabase Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
