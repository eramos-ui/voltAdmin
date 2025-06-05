// pages/api/files/[fileId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { connectGridFS, gfs } from '@/lib/gridfs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 console.log('📦 API /api/files/[fileId] invocada');
 console.log('req.query:', req.query);
  await connectGridFS();
  const fileIdParam = req.query.fileId;
  console.log('fileIdParam', fileIdParam);
  const fileId = Array.isArray(fileIdParam) ? fileIdParam[0] : fileIdParam;

  // Asegura que sea un string simple
  if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
    return res.status(400).json({ error: 'fileId inválido' });
  }

  try {
    const objectId = new mongoose.Types.ObjectId(fileId);

    const downloadStream = gfs.openDownloadStream(objectId);

    res.setHeader('Content-Type', 'application/octet-stream');

    downloadStream
      .on('error', (err) => {
        console.error('❌ Error al leer archivo de GridFS:', err);
        res.status(404).json({ error: 'Archivo no encontrado' });
      })
      .pipe(res);
  } catch (error) {
    console.error('❌ Error general al descargar archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

