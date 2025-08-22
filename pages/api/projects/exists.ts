// pages/api/projects/exists.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Project} from '@/models/Project';

function normalizeName(s: string) {
    return s
      .trim()
      .replace(/\s+/g, ' ')
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, ''); // quita acentos
  }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = req.query.name;
  const name = Array.isArray(raw) ? raw[0] : raw;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Parámetro name inválido' });
  }

  try {
    const nameNormal=normalizeName(name)
    await connectDB();
    const exists = await Project.exists({ projectName: name });//sin normalizar el name
    // console.log('exists en API ',exists,name,nameNormal)
    if (exists) return res.status(409).json({ error: 'El nombre de proyecto ya existe', exists: true });
    // No existe: 204 No Content o 200 con exists:false
    return res.status(204).end();//proyecto NO existe, devuelve un 204
  } catch (error) {
    console.error('❌ Error al verificar nombre:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
