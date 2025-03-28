import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import { uploadFileToFirebase } from '@/lib/server/firebase/uploadFileToFirebase';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Error al procesar formulario:', err);
      return res.status(500).json({ error: 'Error al procesar archivo' });
    }

    const fileField = files.file;
    const file = Array.isArray(fileField) ? fileField[0] : fileField;

    if (!file || !file.filepath || !file.mimetype || !file.originalFilename) {
      return res.status(400).json({ error: 'Archivo inválido o incompleto' });
    }

    try {
      const fileData = await fs.promises.readFile(file.filepath);
      const base64Data = fileData.toString('base64');

      const downloadURL = await uploadFileToFirebase({
        fileName: file.originalFilename,
        fileData: base64Data,
        fileType: file.mimetype,
        fileClass: 'test',
        userId: 'demo-user',
        rowId: 'test-row',
      });

      return res.status(200).json({ success: true, downloadURL });
    } catch (uploadError) {
      console.error('❌ Error al subir archivo a Firebase:', uploadError);
      return res.status(500).json({ error: 'Error al subir archivo' });
    }
  });
}
