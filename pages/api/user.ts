import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await prisma.user.findFirst(); // Obtén el primer usuario
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user data' });
  } finally {
    await prisma.$disconnect();
  }
}
