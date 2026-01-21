import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle()

        if (error) {
            console.error("Supabase Query Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ exists: !!data })
    } catch (error: any) {
        console.error("Unexpected API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
