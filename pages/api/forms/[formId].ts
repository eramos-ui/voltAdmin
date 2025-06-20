// /pages/api/forms/[formId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import FormModel from '@/models/Form'; // Asegúrate de que esta ruta sea correcta

// Asegúrate de tener una función de conexión
import { connectDB } from '@/lib/db'; // Ajusta a tu conexión Mongo

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { formId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  if (!formId || Array.isArray(formId)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const form = await FormModel.findOne({ formId: parseInt(formId, 10), valid: true });

    if (!form) {
      return res.status(404).json({ message: 'Formulario no encontrado o no válido' });
    }

    return res.status(200).json(form);
  } catch (error) {
    console.error('Error al obtener formulario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
