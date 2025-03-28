import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
import { bucket } from '../firebaseConfig'; // asegúrate de exportar el bucket desde firebaseConfig

export type UploadFileParams = {
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
  const firebasePath = `projects/${userId}/${fileClass}/${rowId}/${Date.now()}_${fileName}`;
  const buffer = Buffer.from(fileData, 'base64');
  const file = bucket.file(firebasePath);
  const token = uuidv4();
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
  console.log('🔑 en uploadFileToFirebase token:', token);
  const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
    firebasePath
  )}?alt=media&token=${token}`;
  //const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(firebasePath)}?alt=media`;
  return downloadURL;
};
