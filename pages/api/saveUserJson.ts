// pages/api/saveUserJson.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/lib/server/db';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { storedProcedure, parameters } = req.body;

  if (!storedProcedure || typeof parameters !== 'object') {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const pool = await connectToDB();
    const request = pool.request();

    // Recorrer los parámetros
    for (const [key, value] of Object.entries(parameters)) {
      const isAvatar = key === 'avatar';
      request.input(
        key,
        isAvatar ? sql.NVarChar(sql.MAX) : sql.NVarChar, // puedes ajustar tipo por campo si necesitas
        value
      );
    }

    const result = await request.execute(storedProcedure);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('❌ Error ejecutando SP:', error);
    return res.status(500).json({ error: 'Error en la base de datos' });
  }
}
