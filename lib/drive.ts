import { google } from 'googleapis';
import { Readable } from 'stream';

// Inisialisasi Auth Service Account Google
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

export const drive = google.drive({ version: 'v3', auth });

/**
 * Mencari atau membuat folder bulanan (Format: YYYY-MM) di dalam parent folder Google Drive
 */
export async function getOrCreateMonthlyFolder(
  parentFolderId: string,
  folderName: string
): Promise<string> {
  try {
    // 1. Cek apakah folder bulan berjalan sudah ada
    const searchResponse = await drive.files.list({
      q: `'${parentFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
    });

    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      return searchResponse.data.files[0].id!;
    }

    // 2. Jika belum ada, buat folder baru
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    };

    const newFolder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    return newFolder.data.id!;
  } catch (error) {
    console.error('Error on getOrCreateMonthlyFolder:', error);
    throw error;
  }
}

/**
 * Upload file PDF ke Google Drive dalam folder bulanan
 */
export async function uploadResiToDrive(file: File, orderDate: string) {
  const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
  const monthlyFolderName = orderDate.substring(0, 7); // Mengambil "YYYY-MM" dari "YYYY-MM-DD"

  // Dapatkan ID folder bulanan
  const targetFolderId = await getOrCreateMonthlyFolder(parentFolderId, monthlyFolderName);

  // Konversi Web File Buffer ke Node Readable Stream
  const buffer = Buffer.from(await file.arrayBuffer());
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const fileMetadata = {
    name: file.name,
    parents: [targetFolderId],
  };

  const media = {
    mimeType: 'application/pdf',
    body: stream,
  };

  // Upload file ke Drive
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink',
  });

  return {
    fileId: response.data.id,
    webViewLink: response.data.webViewLink,
    webContentLink: response.data.webContentLink,
  };
}
