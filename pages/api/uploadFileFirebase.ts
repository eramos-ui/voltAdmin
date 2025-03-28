import { v4 as uuidv4 } from 'uuid';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, cert, App } from 'firebase-admin/app';
import path from 'path';
import fs from 'fs';

// ⚠️ Asegúrate de que esta ruta sea correcta y esté en .gitignore
const serviceAccountPath = path.resolve(process.cwd(), 'credentials/firebase-service-account.json');

let app: App | null = null;

if (!app && fs.existsSync(serviceAccountPath)) {
  app = initializeApp({
    credential: cert(require(serviceAccountPath)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // ejemplo: 'tu-bucket.appspot.com'
  });
}

const bucket = getStorage().bucket();

type UploadFileParams = {
  fileName: string;
  fileData: string; // base64
  fileType: string;
  fileClass: string;
  userId: string;
  rowId?: string;
};

export const uploadFileToFirebase = async ({
  fileName,
  fileData,
  fileType,
  fileClass,
  userId,
  rowId = '',
}: UploadFileParams): Promise<string> => {
  const uniqueName = `${Date.now()}_${fileName}`;
  const firebasePath = `projects/${userId}/${fileClass}/${rowId}/${uniqueName}`;
  
  const token = uuidv4(); // ✅ Generar el token
  const buffer = Buffer.from(fileData, 'base64');
  const file = bucket.file(firebasePath);

  await file.save(buffer, {
    metadata: {
      contentType: fileType,
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
      cacheControl: 'public,max-age=31536000',
    },
    public: true,
    resumable: false,
  });

  // ✅ Incluir el token en la URL
  console.log('🔑 En API uploadFileToFirebase token:', token);
  const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
    firebasePath
  )}?alt=media&token=${token}`;

  return downloadURL;
};
