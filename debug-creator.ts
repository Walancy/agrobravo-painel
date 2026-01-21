
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMissionsCreator() {
    console.log('Fetching missions with creators...')
    const { data, error } = await supabase
        .from('missoes')
        .select('*, criador:users!criado_por(nome)')
        .limit(5)

    if (error) {
        console.error('Error fetching missions:', error)
    } else {
        console.log('Missions sample:', JSON.stringify(data, null, 2))
    }
}

checkMissionsCreator()
