import { bucket } from './firebaseConfig';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import mime from 'mime-types';
import fs from 'fs/promises';

/**
 * Sube un archivo a Firebase Storage
 * @param localFilePath Ruta local del archivo a subir
 * @param destinationPath Ruta destino en Firebase Storage (por ejemplo: "avatars/nombre.png")
 * @returns URL pública del archivo subido
 */
export async function uploadFileToFirebase(localFilePath: string, destinationPath: string): Promise<string> {
  try {
    const metadata = {
      metadata: {
        firebaseStorageDownloadTokens: uuidv4(), // 🔑 token para acceso público
      },
      contentType: mime.lookup(localFilePath) || undefined,
      cacheControl: 'public,max-age=31536000',
    };

    await bucket.upload(localFilePath, {
      destination: destinationPath,
      metadata,
    });

    const encodedPath = encodeURIComponent(destinationPath);
    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${metadata.metadata.firebaseStorageDownloadTokens}`;

    console.log('✅ En util/server/uploadFileToFirebase archivo subido a Firebase:', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('❌ Error subiendo archivo a Firebase:', error);
    throw error;
  }
}
