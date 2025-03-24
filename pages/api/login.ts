import { NextApiRequest, NextApiResponse } from 'next';
import { executeSP } from '@/lib/server/spExecutor';
import sql from 'mssql';
import bcrypt from 'bcryptjs';

interface UserFromTVF {
  id: number;
  name: string;
  email: string;
  password: string;
  theme: string;
  avatar: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;
  console.log('🔐 Login attempt', email);

  try {
    const result = await executeSP<UserFromTVF>('getUserByEmail', [
      { name: 'email', type: sql.NVarChar(100), value: email },
    ]);

    const user = result[0];

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Login exitoso
    res.status(200).json({ userId: user.id });
  } catch (error) {
    console.error('❌ Error in login handler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}



// import { NextApiRequest, NextApiResponse } from 'next';
// import { Prisma Client } from '@prisma/client';
// import bcrypt from 'bcryptjs';

// const prisma = new Prisma Client();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   const { email, password } = req.body;
//    console.log('api login',email, password )
//   try {
//      const user = await prisma.user.findUnique({
//           where: { email },
//           select: { id: true, name: true, email: true, avatar: true, theme: true, password: true } // Incluir la contraseña en la consulta
//     });
//     console.log('api login user',user )
//     if (!user || !bcrypt.compareSync(password, user.password)) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     // Autenticación exitosa
//     res.status(200).json({ userId: user.id });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error' });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
