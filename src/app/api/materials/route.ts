import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
        return NextResponse.json({ error: 'GroupId is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { data, error } = await supabase
            .from('materiais')
            .select('*')
            .eq('grupo_id', groupId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Fetch Materials Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const name = formData.get('name') as string;
        const groupId = formData.get('groupId') as string;
        const isVisible = formData.get('isVisible') === 'true';

        if (!file || !name || !groupId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Upload to Supabase Storage
        // Assuming a bucket named 'materials' exists
        const fileExt = file.name.split('.').pop();
        const fileName = `${groupId}/${Date.now()}.${fileExt}`;

        // Convert File to Buffer/ArrayBuffer for upload if needed, 
        // but Supabase js client accepts File object usually.
        // However in Node environment (Next.js API), 'File' might need handling.
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Ensure 'materials' bucket exists
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('materials');
        if (bucketError) {
            console.log("Bucket 'materials' not found, attempting to create...");
            const { error: createError } = await supabase.storage.createBucket('materials', {
                public: true,
                fileSizeLimit: 10485760, // 10MB
                allowedMimeTypes: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'image/png',
                    'image/jpeg',
                    'image/jpg',
                    'image/webp'
                ]
            });
            if (createError) {
                console.error("Create Bucket Error:", createError);
                // Proceeding anyway, hoping it exists or next step handles it
            }
        }

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('materials')
            .upload(fileName, fileBuffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            // If bucket doesn't exist, we might fail here. 
            // We can try to handle it or just throw.
            throw new Error(`Storage Upload Error: ${uploadError.message}`);
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('materials')
            .getPublicUrl(fileName);

        // Insert into DB
        const { data: insertData, error: insertError } = await supabase
            .from('materiais')
            .insert({
                grupo_id: groupId,
                nome: name,
                tamanho: formatBytes(file.size), // Helper function
                url: publicUrl,
                status: isVisible ? 'Visivel' : 'Oculto',
            })
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json(insertData);

    } catch (error: any) {
        console.error("Add Material Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabase = createClient(supabaseUrl!, supabaseKey!);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // First get the record to find the file path (if we want to delete from storage)
        const { data: material, error: fetchError } = await supabase
            .from('materiais')
            .select('url')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // Extract path from URL to delete from storage?
        // URL is like: .../storage/v1/object/public/materials/groupId/timestamp.ext
        // path is groupId/timestamp.ext
        if (material && material.url) {
            const urlParts = material.url.split('/materials/');
            if (urlParts.length > 1) {
                const path = urlParts[1];
                await supabase.storage.from('materials').remove([path]);
            }
        }

        const { error } = await supabase
            .from('materiais')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete Material Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabase = createClient(supabaseUrl!, supabaseKey!);

        const body = await request.json();
        const { id, status } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { error } = await supabase
            .from('materiais')
            .update({ status: status }) // Currently only updating status
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Update Material Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
}
