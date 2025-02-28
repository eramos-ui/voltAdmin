import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { generateFileHash } from '@/utils/generateFileHash';

type MimeType = 'image/jpeg' | 'image/png' | 'image/gif' ;
const mimeToExtension: Record<MimeType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
};

export const config = {
  api: {
    bodyParser: false,
  },
};
const prisma = new PrismaClient();
//const baseUrl=process.env.NEXT_PUBLIC_URL;
// async function getUserFromApi(userId: number) {
//   console.log('baseUrl',baseUrl,userId);
//   const response = await fetch(`${baseUrl}/api/getUser?userId=${userId}`);
//   if (!response.ok) {
//     throw new Error(`Error al obtener el usuario: ${response.statusText}`);
//   }
//   const userData = await response.json();
//   return userData;
// }


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


    // const sp= fields.storedProcedure;
    // const parameters=fields.parameters;
    // Validar los datos del formulario

    //const id = fields.userId as string;
    // const name = fields.name as string;
    // const email = fields.email as string;
    // const theme = fields.theme as string;


        // Extraer storedProcedure y parameters desde fields
    const storedProcedure = Array.isArray(fields.storedProcedure)
    ? fields.storedProcedure[0]
    : fields.storedProcedure;
    const parametersString = Array.isArray(fields.parameters)
    ? fields.parameters[0]
    : fields.parameters;

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
    console.log('sp',storedProcedure, parameters);

    // let currentUser;
    // try {
    //   currentUser = await getUserFromApi(parameters.id);
    // } catch (error) {
    //   console.error('Error al obtener el usuario:', error);
    //   return res.status(500).json({ error: 'Error al obtener el usuario' });
    // }
    //console.log('Usuario actual:', currentUser);



    
  // Log del contenido del `fields` y `files`
  //console.log('Fields:', fields); // Verifica los campos enviados
  // console.log('Files:', files);   // Verifica si el archivo avatar está presente

  // Verifica específicamente el campo avatar
  // if (!files.avatar) {
  //   console.warn('El archivo avatar no se encuentra en el request');
  // } else {
  //   console.log('Archivo avatar recibido:', files.avatar);
  // }
  

  // const currentUser = await prisma.user.findUnique({
  //   where: { id: parameters.id },
  //   select: { avatar: true },
  // });
    let typeFile :string | null= null;
    let avatarFile: string | undefined;
    let filename: string | null=null;
    
    if (files.avatar) {
      if (Array.isArray(files.avatar)) {
        avatarFile = (files.avatar[0] as formidable.File)?.filepath;
        typeFile   = (files.avatar[0] as formidable.File)?.mimetype;
        filename   = (files.avatar[0] as formidable.File)?.newFilename;
      } else {
        avatarFile = (files.avatar as formidable.File)?.filepath;
        typeFile   = (files.avatar as formidable.File)?.mimetype;
        filename   = (files.avatar as formidable.File)?.newFilename;
      }

      // console.log('avatarFile' , avatarFile, typeFile, filename);
      
    }
    if (!avatarFile || !typeFile) {
      return res.status(400).json({ error: 'Archivo avatar o tipo no encontrado' });
    }
    // Validar si el tipo MIME está soportado
    if (!(typeFile in mimeToExtension)) {
      return res.status(400).json({ error: 'Formato de archivo no soportado' });
    }
    const fileExtension = mimeToExtension[typeFile as keyof typeof mimeToExtension];
    // Generar el nombre y la ruta del archivo
    const destinationDir = path.join('D:\\files\\upload\\avatar');
    const fileName = `${filename}${fileExtension}`; // Generar el nombre del archivo con la extensión
    const destinationPath = path.join(destinationDir, fileName);

    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    try {
      fs.copyFileSync(avatarFile, destinationPath); // Copiar el archivo al destino
      fs.unlinkSync(avatarFile); // Eliminar el archivo temporal
      res.status(200).json({ success: true, avatarPath: fileName });
    } catch (error) {
      console.error('Error al guardar el archivo avatar:', error);
      res.status(500).json({ error: 'Error al guardar el archivo avatar' });
    }
    console.log('avatarFile, destinationPath',avatarFile, destinationPath);
    
    //if (mimeType) console.log('mimeToExtension',mimeToExtension,mimeToExtension[mimeType] );

   // Comparar hashes
    // const currentFileHash = avatarPath && fs.existsSync(avatarPath) ? generateFileHash(avatarPath) : null;
    // const newFileHash = generateFileHash(avatarFile);

    // Agregar avatarPath a los parámetros si existe
    const avatarPath=fileName;
    if (avatarPath) {
      parameters.avatar = avatarPath; // Agrega la ubicación del avatar a los parámetros
    }
    // Ejecutar el stored procedure con Prisma
    try {
      const result = await prisma.$executeRawUnsafe(`
        EXEC ${storedProcedure} @jsonData = N'${JSON.stringify(parameters)}'
      `);
      console.log('Resultado del stored procedure:', result);
      res.status(200).json({ success: true, avatarPath });
    } catch (error) {
      console.error('Error al ejecutar el stored procedure:', error);
      res.status(500).json({ error: 'Error al actualizar los datos del usuario' });
    }
  });
}
