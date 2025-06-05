import { NextApiRequest, NextApiResponse } from 'next';
import { executeSP, executeNonQuery } from '@/lib/server/spExecutor';
import sql from 'mssql';
import bcrypt from 'bcryptjs';

interface UserFromToken {
  id: number;
  email: string;
  resetTokenExpiry: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token y contraseña son obligatorios' });
  }

  try {
    const users = await executeSP<UserFromToken>('getUserByToken', [
      { name: 'token', type: sql.NVarChar(200), value: token }
    ]);

    const user = users[0];

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const expiryDate = new Date(user.resetTokenExpiry);
    if (expiryDate < new Date()) {
      return res.status(400).json({ error: 'Token expirado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await executeNonQuery('updatePasswordFromToken', [
      { name: 'token', type: sql.NVarChar(200), value: token },
      { name: 'hashedPassword', type: sql.NVarChar(255), value: hashedPassword }
    ]);

    res.status(200).json({ message: 'Contraseña restablecida con éxito' });
  } catch (error) {
    console.error('❌ Error restableciendo la contraseña:', error);
    res.status(500).json({ error: 'Error restableciendo la contraseña' });
  }
}

