import { NextRequest, NextResponse } from 'next/server';
import { uploadResiToDrive } from '@/lib/drive';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const orderDate = formData.get('orderDate') as string;

    if (!file || !orderDate) {
      return NextResponse.json(
        { error: 'File PDF atau Tanggal Pesanan tidak valid' },
        { status: 400 }
      );
    }

    const uploadResult = await uploadResiToDrive(file, orderDate);

    return NextResponse.json({
      fileId: uploadResult.fileId,
      webViewLink: uploadResult.webViewLink,
    });
  } catch (error: any) {
    console.error('API Upload Drive Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memproses upload ke Google Drive' },
      { status: 500 }
    );
  }
}
