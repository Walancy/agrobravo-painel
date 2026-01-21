import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const formData = await request.formData()
        const file = formData.get('file') as File
        const type = formData.get('type') as string
        const name = formData.get('name') as string
        const expiryDate = formData.get('expiryDate') as string

        if (!file || !type) {
            return NextResponse.json({ error: 'File and Type are required' }, { status: 400 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 1. Upload file to Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const bucketName = 'traveler-documents' // or 'documents' depending on setup

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer()
        const fileBuffer = new Uint8Array(arrayBuffer)

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from(bucketName)
            .upload(fileName, fileBuffer, {
                contentType: file.type,
                upsert: false
            })

        if (uploadError) {
            // Attempt to create bucket if it doesn't exist? 
            // Usually simpler to just error out or try a fallback public bucket
            console.error("Storage Upload Error:", uploadError)
            return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
        }

        const { data: { publicUrl } } = supabase
            .storage
            .from(bucketName)
            .getPublicUrl(fileName)

        // 2. Insert into Database
        const { data: doc, error: dbError } = await supabase
            .from('documentos')
            .insert({
                user_id: id,
                nome: name || file.name,
                tipo: type,
                url: publicUrl,
                status: 'pending', // Default status
                data_validade: expiryDate || null,
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (dbError) {
            console.error("Database Insert Error:", dbError)
            // Cleanup storage if db fails?
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        return NextResponse.json(doc)
    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
