
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkLastMissionLogo() {
    console.log('Fetching last mission...')
    const { data, error } = await supabase
        .from('missoes')
        .select('id, nome, logo')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error) {
        console.error('Error fetching mission:', error)
    } else {
        console.log('Last Mission:', data)
        if (data.logo) {
            console.log('Logo URL:', data.logo)
        } else {
            console.log('No logo URL found on last mission.')
        }
    }
}

checkLastMissionLogo()
