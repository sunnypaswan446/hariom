import { NextResponse } from 'next/server';
import type { UploadApiResponse } from 'cloudinary';
import cloudinary from '@/lib/cloudinary';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';

type CaseDocumentRow = Database['public']['Tables']['case_documents']['Row'];
type CaseDocumentInsert = Database['public']['Tables']['case_documents']['Insert'];

export const runtime = 'nodejs';

async function uploadToCloudinary(file: File): Promise<UploadApiResponse> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'case-documents', resource_type: 'auto' },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload failed'));
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const caseId = formData.get('caseId');
    const documentType = formData.get('documentType');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }

    if (!caseId || typeof caseId !== 'string') {
      return NextResponse.json({ error: 'caseId is required.' }, { status: 400 });
    }

    if (!documentType || typeof documentType !== 'string') {
      return NextResponse.json({ error: 'documentType is required.' }, { status: 400 });
    }

    const uploadResult = await uploadToCloudinary(file);

    // Rely on database defaults/timestamps; omit columns that may not exist in cache
    const payload: CaseDocumentInsert = {
      case_id: caseId,
      document_type: documentType,
      uploaded: true,
      file_url: uploadResult.secure_url,
    };

    const table = 'case_documents' satisfies keyof Database['public']['Tables'];

    // Use primary-key upsert (or insert) to avoid missing constraint errors on custom conflict targets
    const { data, error } = await (supabaseAdmin.from(table) as any)
      .upsert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ document: data as CaseDocumentRow });
  } catch (err: any) {
    console.error('[case-documents][POST]', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to upload document.' },
      { status: 500 }
    );
  }
}
