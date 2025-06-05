import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import { promises as fs } from 'fs';
import { executeSP } from '@/lib/server/spExecutor';
import sql from 'mssql';

export const config = {
  api: {
    bodyParser: false, // Deshabilitar el body parser para manejar archivos
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Error parsing form:', err);
      return res.status(500).json({ error: 'Error parsing the file' });
    }

    const file = files.avatar as File | undefined;
    const userId = fields.userId?.[0] || fields.userId;

    if (!file || !userId) {
      return res.status(400).json({ error: 'Archivo o userId faltante' });
    }

    try {
      const fileData = await fs.readFile(file.filepath);
      const avatarBase64 = fileData.toString('base64');

      // Llama a tu stored procedure para guardar el avatar
      await executeSP('sp_UpdateUserAvatar', [
        { name: 'userId', type: sql.Int, value: Number(userId) },
        { name: 'avatar', type: sql.NVarChar(sql.MAX), value: avatarBase64 },
      ]);

      res.status(200).json({ avatarUrl: avatarBase64 });
    } catch (error) {
      console.error('❌ Error guardando el avatar en la base de datos:', error);
      res.status(500).json({ error: 'Error guardando el avatar en la base de datos' });
    }
  });
}
