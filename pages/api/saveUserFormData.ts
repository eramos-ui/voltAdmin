
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




// import type { NextApiRequest, NextApiResponse } from 'next';
// import { Prisma Client } from '@prisma/client';
// import formidable from 'formidable';
// import fs from 'fs';
// import path from 'path';
// import { generateFileHash } from '@/utils/generateFileHash';

// type MimeType = 'image/jpeg' | 'image/png' | 'image/gif' ;
// const mimeToExtension: Record<MimeType, string> = {
//   'image/jpeg': '.jpg',
//   'image/png': '.png',
//   'image/gif': '.gif',
// };

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
// const prisma = new Prisma Client();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const form = formidable();
//   form.parse(req, async (err, fields, files) => {
//     if (err) {
//       console.error('Error al procesar FormData:', err);
//       return res.status(400).json({ error: 'Error al procesar los datos' });
//     }
//         // Extraer storedProcedure y parameters desde fields
//     const storedProcedure = Array.isArray(fields.storedProcedure)
//     ? fields.storedProcedure[0]
//     : fields.storedProcedure;
//     const parametersString = Array.isArray(fields.parameters)
//     ? fields.parameters[0]
//     : fields.parameters;

//   if (!storedProcedure || !parametersString) {
//     return res.status(400).json({ error: 'storedProcedure o parameters no están presentes' });
//   }

//   let parameters;
//   try {
//     parameters = JSON.parse(parametersString);
//   } catch (error) {
//     console.error('Error al parsear parameters:', error);
//     return res.status(400).json({ error: 'Los parámetros no son un JSON válido' });
//   }
//     console.log('sp',storedProcedure, parameters);

//     let typeFile :string | null= null;
//     let avatarFile: string | undefined;
//     let filename: string | null=null;
    
//     if (files.avatar) {
//       if (Array.isArray(files.avatar)) {
//         avatarFile = (files.avatar[0] as formidable.File)?.filepath;
//         typeFile   = (files.avatar[0] as formidable.File)?.mimetype;
//         filename   = (files.avatar[0] as formidable.File)?.newFilename;
//       } else {
//         avatarFile = (files.avatar as formidable.File)?.filepath;
//         typeFile   = (files.avatar as formidable.File)?.mimetype;
//         filename   = (files.avatar as formidable.File)?.newFilename;
//       }
//     }
//     if (!avatarFile || !typeFile) {
//       return res.status(400).json({ error: 'Archivo avatar o tipo no encontrado' });
//     }
//     // Validar si el tipo MIME está soportado
//     if (!(typeFile in mimeToExtension)) {
//       return res.status(400).json({ error: 'Formato de archivo no soportado' });
//     }
//     const fileExtension = mimeToExtension[typeFile as keyof typeof mimeToExtension];
//     // Generar el nombre y la ruta del archivo
//     const destinationDir = path.join('D:\\files\\upload\\avatar');
//     const fileName = `${filename}${fileExtension}`; // Generar el nombre del archivo con la extensión
//     const destinationPath = path.join(destinationDir, fileName);

//     if (!fs.existsSync(destinationDir)) {
//       fs.mkdirSync(destinationDir, { recursive: true });
//     }

//     try {
//       fs.copyFileSync(avatarFile, destinationPath); // Copiar el archivo al destino
//       fs.unlinkSync(avatarFile); // Eliminar el archivo temporal
//       res.status(200).json({ success: true, avatarPath: fileName });
//     } catch (error) {
//       console.error('Error al guardar el archivo avatar:', error);
//       res.status(500).json({ error: 'Error al guardar el archivo avatar' });
//     }
//     console.log('avatarFile, destinationPath',avatarFile, destinationPath);

//     // Agregar avatarPath a los parámetros si existe
//     const avatarPath=fileName;
//     if (avatarPath) {
//       parameters.avatar = avatarPath; // Agrega la ubicación del avatar a los parámetros
//     }
//     // Ejecutar el stored procedure con Prisma
//     try {
//       const result = await prisma.$executeRawUnsafe(`
//         EXEC ${storedProcedure} @jsonData = N'${JSON.stringify(parameters)}'
//       `);
//       console.log('Resultado del stored procedure:', result);
//       res.status(200).json({ success: true, avatarPath });
//     } catch (error) {
//       console.error('Error al ejecutar el stored procedure:', error);
//       res.status(500).json({ error: 'Error al actualizar los datos del usuario' });
//     }
//   });
// }
