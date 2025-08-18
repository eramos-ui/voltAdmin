// api/project/projectByName.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Project } from '@/models/Project';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  console.log('en api getProjectByName name',name)
  if (!name  ) {
    return res.status(400).json({ error: 'Parámetro projectName inválido' });
  }
  // res.status(200).json('en prueba');

  try {
    await connectDB();
    const project = await Project.findOne({ projectName: name }).lean();

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('❌ Error al buscar proyecto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}