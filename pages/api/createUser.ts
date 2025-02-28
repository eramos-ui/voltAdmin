// import { NextApiRequest, NextApiResponse } from 'next';
// import bcrypt from 'bcryptjs';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method === 'POST') {
//       const { name, email, password } = req.body;
  
//       if (!name || !email || !password) {
//         return res.status(400).json({ error: 'Missing fields' });
//       }
//       // Hash the password
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       try {
//         const newUser = await prisma.user.create({
//           data: {
//             name,
//             email,
//             password: hashedPassword,
//             theme: 'light',
//           },
//         });
//         //console.log('creando nuevo usuario',newUser)
//         return res.status(201).json({ user: newUser });
//       } catch (error) {
//         console.error('Error creating user:', error);
//         return res.status(500).json({ error: 'Error creating user' });
//       }
//     } else {
//       return res.status(405).json({ error: 'Method not allowed' });
//     }
//   }