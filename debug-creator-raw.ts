
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRawCreatorId() {
    console.log('Fetching raw criado_por...')
    const { data: missions } = await supabase
        .from('missoes')
        .select('id, nome, criado_por')
        .limit(5)

    console.log('Missions:', missions)

    if (missions && missions.length > 0) {
        const creatorId = missions[0].criado_por
        if (creatorId) {
            console.log(`Checking user with ID: ${creatorId}`)
            const { data: user } = await supabase
                .from('users')
                .select('id, nome')
                .eq('id', creatorId)
                .single()
            console.log('User found:', user)
        } else {
            console.log('First mission has no creator ID.')
        }
    }
}

checkRawCreatorId()
