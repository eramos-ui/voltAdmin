
import { NextApiRequest, NextApiResponse } from 'next'; 
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { executeSP } from '@/lib/server/spExecutor';
import sql from 'mssql';

export const config = {
  api: {
    bodyParser: false,
  },
};

type MimeType = 'image/jpeg' | 'image/png' | 'image/gif';
const mimeToExtension: Record<MimeType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error al procesar FormData:', err);
      return res.status(400).json({ error: 'Error al procesar los datos' });
    }

    const storedProcedure = Array.isArray(fields.storedProcedure) ? fields.storedProcedure[0] : fields.storedProcedure;
    const parametersString = Array.isArray(fields.parameters) ? fields.parameters[0] : fields.parameters;

    if (!storedProcedure || !parametersString) {
      return res.status(400).json({ error: 'storedProcedure o parameters no están presentes' });
    }

    let parameters;
    try {
      parameters = JSON.parse(parametersString);
    } catch (error) {
      console.error('Error al parsear parameters:', error);
      return res.status(400).json({ error: 'Los parámetros no son un JSON válido' });
    }

    let typeFile: string | null = null;
    let avatarFile: string | undefined;
    let filename: string | null = null;

    if (files.avatar) {
      const avatar = Array.isArray(files.avatar) ? files.avatar[0] : files.avatar;
      avatarFile = avatar?.filepath;
      typeFile = avatar?.mimetype;
      filename = avatar?.newFilename;
    }

    if (!avatarFile || !typeFile) {
      return res.status(400).json({ error: 'Archivo avatar o tipo no encontrado' });
    }

    if (!(typeFile in mimeToExtension)) {
      return res.status(400).json({ error: 'Formato de archivo no soportado' });
    }

    const fileExtension = mimeToExtension[typeFile as MimeType];
    const destinationDir = path.join('D:\\files\\upload\\avatar');
    const fileName = `${filename}${fileExtension}`;
    const destinationPath = path.join(destinationDir, fileName);

    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    try {
      fs.copyFileSync(avatarFile, destinationPath);
      fs.unlinkSync(avatarFile);
    } catch (error) {
      console.error('Error al guardar el archivo avatar:', error);
      return res.status(500).json({ error: 'Error al guardar el archivo avatar' });
    }

    const avatarPath = fileName;
    if (avatarPath) {
      parameters.avatar = avatarPath;
    }

    try {
      await executeSP(storedProcedure, [
        { name: 'jsonData', type: sql.NVarChar(sql.MAX), value: JSON.stringify(parameters) }
      ]);

      res.status(200).json({ success: true, avatarPath });
    } catch (error) {
      console.error('Error al ejecutar el stored procedure:', error);
      res.status(500).json({ error: 'Error al actualizar los datos del usuario' });
    }
  });
}
