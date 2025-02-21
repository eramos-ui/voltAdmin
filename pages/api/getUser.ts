import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
interface UserFromTVF {
  id: number;
  name: string;
  email: string;
  language: string;
  theme: string;
  rut: string;
  roleId:number;
  phone: string;
  avatar:string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  if (!userId || Array.isArray(userId)) {
    return res.status(400).json({ error: 'Invalid or missing userId' });
  }
  try {
    //console.log('query',`SELECT * FROM getUserById(${userId})`)
    const users = await prisma.$queryRaw<UserFromTVF[]>`SELECT * FROM getUserById(${userId})`;
    const user=users[0];
    //console.log(' en getUser user',user);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  } finally {
    await prisma.$disconnect();
  }
}
