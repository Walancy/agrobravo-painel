
import { createClient } from '@supabase/supabase-js'



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!


const supabase = createClient(supabaseUrl, supabaseKey)

async function inspect() {
    console.log('Inspecting "eventos" table schema...')

    // We can't easily query information_schema with supabase-js directly without rpc, 
    // but we can try to insert a dummy row with a UUID in passageiros and see the error, 
    // OR we can just try to select one row and see what we get.

    // Actually, the error message `invalid input syntax for type integer: "..."` 
    // strongly suggests the column is integer[].

    // Let's try to fetch one row to see the current data structure if possible.
    const { data: rows, error } = await supabase.from('eventos').select('*').limit(1)

    if (error) {
        console.error('Error fetching events:', error)
    } else if (rows && rows.length > 0) {
        console.log('Sample event:', rows[0])
        console.log('Type of passageiros:', typeof rows[0].passageiros)
        if (Array.isArray(rows[0].passageiros)) {
            console.log('Passageiros array content:', rows[0].passageiros)
        }
    } else {
        console.log('No events found.')
    }
}

inspect()
