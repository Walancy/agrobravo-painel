
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupStorage() {
    console.log('Checking storage buckets...')
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
        console.error('Error listing buckets:', error)
        return
    }

    const bucketName = 'mission-logos'
    const bucket = buckets.find(b => b.name === bucketName)

    if (bucket) {
        console.log(`Bucket '${bucketName}' already exists.`)
    } else {
        console.log(`Creating bucket '${bucketName}'...`)
        const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true
        })
        if (createError) {
            console.error('Error creating bucket:', createError)
        } else {
            console.log('Bucket created successfully.')
        }
    }
}

setupStorage()
