// pages/api/files/by-project.ts
//lee todos los archivos de un proyecto que están en la colección uploads.files
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB, getDatabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido. Usa GET.' });
  }

  const { idProject } = req.query;

  if (!idProject || isNaN(Number(idProject))) {
    return res.status(400).json({ error: 'Parámetro idProject inválido o ausente.' });
  }

  try {
    await connectDB();
    const db = await getDatabase();

    let files = await db
      .collection('uploads.files')
      .find({ 'metadata.idProject': Number(idProject) })
      .toArray();
      files=files.map((file:any) => {
        // console.log('file',file);
        let fileType=file.filename.split('.').pop().toLowerCase();
        if (fileType==='pdf'){
          fileType='application/pdf';
        }
        if (fileType==='docx'){
          fileType='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
        if (fileType==='xlsx'){
          fileType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        if (fileType==='xls'){
          fileType='application/vnd.ms-excel';
        }
        if (fileType==='jpg'){
          fileType='image/jpeg';
        }
        if (fileType==='jpeg'){
          fileType='image/jpeg';
        }
        if (fileType==='png'){
          fileType='image/png';
        }
        if (fileType==='gif'){
          fileType='image/gif';
        }
        if (fileType==='bmp'){
          fileType='image/bmp';
        }
        if (fileType==='tiff'){
          fileType='image/tiff';
        }
        if (fileType==='ico'){
          fileType='image/x-icon';
        }
        if (fileType==='webp'){
          fileType='image/webp';
        }
        if (fileType==='svg'){
          fileType='image/svg+xml';
        }
        return {
          ...file,
          fileType,
        }
      });
      // console.log('files',files);
    return res.status(200).json(files);
  } catch (error) {
    console.error('❌ Error en /api/files/by-project:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
