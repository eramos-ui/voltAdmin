import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/server/spExecutor'; // Usa executeQuery para funciones tipo TVF
import sql from 'mssql';

interface UserFromTVF {
  id: number;
  name: string;
  email: string;
  language: string;
  theme: string;
  rut: string;
  roleId: number;
  phone: string;
  avatar: string;
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
    const result = await executeQuery<UserFromTVF>(
      'SELECT * FROM getUserById(@userId)',
      [{ name: 'userId', type: sql.Int, value: Number(userId) }]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result[0];
    res.status(200).json(user);
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}
