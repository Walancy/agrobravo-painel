
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPaises() {
    console.log('Fetching paises...')
    const { data, error } = await supabase.from('paises').select('*').limit(20)
    if (error) {
        console.error('Error fetching paises:', error)
    } else {
        console.log('Paises sample:', data)
    }
}

checkPaises()
