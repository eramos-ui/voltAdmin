
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/lib/server/spExecutor'; // Asegúrate de que la ruta coincida con donde guardaste el módulo
// import sql from 'mssql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const pool = await connectToDB();

    const result = await pool.request().execute('LoadUsuario');

    return res.status(200).json(result.recordset); // varias filas
  } catch (error) {
    console.error('❌ Error ejecutando SP:', error);
    return res.status(500).json({ error: 'Error ejecutando SP' });
  }
}

// import type { NextApiRequest, NextApiResponse } from 'next';
// import { connectToDB } from '@/lib/server/db'; // ajusta según la ubicación real
// import sql from 'mssql';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Método no permitido' });
//   }

//   try {
//     const pool = await connectToDB();

//     const result = await pool.request().execute('LoadUsuario');
//     console.log('result',result.recordset)
//     return res.status(200).json(result.recordset);
//   } catch (error) {
//     console.error('Error al ejecutar el SP:', error);
//     return res.status(500).json({ error: 'Error ejecutando el procedimiento almacenado' });
//   }
// }
