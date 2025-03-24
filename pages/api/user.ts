
import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/server/spExecutor';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await executeQuery('SELECT TOP 1 * FROM [user]');
    const user = result[0]; // Obtener el primer usuario
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Error fetching user data' });
  }
}


// import { NextApiRequest, NextApiResponse } from 'next';
// import { Prisma Client } from '@prisma/client';

// const prisma = new Prisma Client();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const user = await prisma.user.findFirst(); // Obtén el primer usuario
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching user data' });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
