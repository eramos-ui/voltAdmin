// import { NextApiRequest, NextApiResponse } from 'next';
// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs';

// const prisma = new PrismaClient();

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
