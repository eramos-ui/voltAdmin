
import type { NextApiRequest, NextApiResponse } from 'next';
import { executeSPScalar } from '@/lib/server/spExecutor';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { values, userModification: usuarioModificacion } = req.body;

  try {
    const updatedValues = {
      ...values,
      usuarioModificacion,
    };

    const utf8Data = Buffer.from(JSON.stringify(updatedValues), 'utf8').toString();

    const result = await executeSPScalar('updateActivity', [
      { name: 'jsonData', type: sql.NVarChar(sql.MAX), value: utf8Data }
    ]);

    const idProject = result;

    if (idProject) console.log("✅ Proyecto guardado correctamente.", idProject);

    res.status(200).json({ message: "Actividad guardada con éxito", idProject });
  } catch (error) {
    console.error("❌ Error al guardar en base de datos:", error);
    res.status(500).json({ error: "Error al guardar proyecto" });
  }
}
