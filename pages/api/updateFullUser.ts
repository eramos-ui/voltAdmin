import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { executeNonQuery } from '@/lib/server/spExecutor'; // o executeSPScalar si devuelves id

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextApiRequest) => {
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    const form = formidable({
      multiples: false,
      uploadDir: '/tmp',
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const uploadDir = path.join(process.cwd(), 'tmp');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const { fields, files } = await parseForm(req);

    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const theme = Array.isArray(fields.theme) ? fields.theme[0] : fields.theme;
    const language = Array.isArray(fields.language) ? fields.language[0] : fields.language;

    if (!userId || !name || !email || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let avatarBase64: string | undefined;
    const fileArray = files.avatar as File[];

    if (fileArray && fileArray.length > 0 && fileArray[0].filepath) {
      const file = fileArray[0];
      const fileData = await fs.readFile(file.filepath);
      avatarBase64 = fileData.toString('base64');
      await fs.unlink(file.filepath);
    }

    // Preparar objeto JSON para enviar al SP
    const userData = {
      id: Number(userId),
      name,
      email,
      theme,
      language,
      avatar: avatarBase64,
    };

    console.log('Ejecutando SP updateUserData con:', userData);

    // Llamada al SP
    await executeNonQuery('updateUserData', [
      {
        name: 'jsonData',
        type: 'NVarChar',
        value: JSON.stringify(userData),
      },
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    return res.status(500).json({ error: 'Error saving user data' });
  }
}



// import { NextApiRequest, NextApiResponse } from 'next';
// import formidable, { File } from 'formidable';
// import { promises as fs } from 'fs';
// import path from 'path';
// import { Prisma Client } from '@prisma/client';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const prisma = new Prisma Client();

// const parseForm = (req: NextApiRequest) => {
//   return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
//     const form = formidable({
//       multiples: false,
//       uploadDir: '/tmp', // Directorio temporal
//       keepExtensions: true,
//     });

//     form.parse(req, (err, fields, files) => {
//       if (err) {
//         console.error('Error parsing form:', err);
//         reject(err);
//       }
//       resolve({ fields, files });
//     });
//   });
// };

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const uploadDir = path.join(process.cwd(), 'tmp');//este es:  D:\nextProject\my-sidebar-project\tmp 
//     // Verificar si el directorio existe, si no, crearlo
//     try {
//         await fs.access(uploadDir);
//     } catch (error) {
//         await fs.mkdir(uploadDir, { recursive: true });
//     }
    
//     const { fields, files } = await parseForm(req);

//     const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
//     const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
//     const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
//     const theme = Array.isArray(fields.theme) ? fields.theme[0] : fields.theme;
//     const language = Array.isArray(fields.language) ? fields.language[0] : fields.language;
 
//     console.log('en updateFullUser',userId,name,email,theme,language);
//     // Verificar que los campos esenciales no sean nulos o vacíos
//     if (!userId || !name || !email || !language) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     let avatarBase64: string | undefined;
//     const fileArray = files.avatar as File[]; // Manejando `files.avatar` como un array

//     if (fileArray && fileArray.length > 0 && fileArray[0].filepath) {
//       const file = fileArray[0]; // Tomar el primer archivo del array
//       //console.log('Processing avatar file:', file);
//       try {
//         const fileData = await fs.readFile(file.filepath);
//         avatarBase64 = fileData.toString('base64');        
//         await fs.unlink(file.filepath); // Eliminar el archivo temporal
//       } catch (fileReadError) {
//         console.error('Error reading avatar file:', fileReadError);
//         return res.status(500).json({ error: 'Error reading avatar file' });
//       }
//     }
//     console.log('en updateFullUser...',userId)   

//   } catch (error) {
//     console.error('Error saving user data:', error);
//     res.status(500).json({ error: 'Error saving user data' });
//   } finally {
//     await prisma.$disconnect();
//   }
// }