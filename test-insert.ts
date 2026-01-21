
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsertInteger() {
    console.log('Testing insert with integer array...')

    const payload = {
        nome: "Debug Mission Integer",
        continente: "América Central",
        paises: [1],
        status: "Planejado"
    }

    const { data, error } = await supabase.from('missoes').insert(payload).select()
    if (error) {
        console.log('Insert Error:', error)
    } else {
        console.log('Insert Success:', data)
    }
}

testInsertInteger()
