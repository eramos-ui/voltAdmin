
import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/server/spExecutor';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { storedProcedure, parameters } = req.body;

  if (!storedProcedure) {
    return res.status(400).json({ error: 'Falta el nombre del stored procedure' });
  }

  try {
    console.log('📦 Ejecutando storedProcedure:', storedProcedure); 

    // Construir parámetros en formato seguro
    const paramArray = parameters
      ? Object.entries(parameters).map(([name, value]) => ({
          name,
          value,
          type: typeof value === 'number' ? require('mssql').Int : require('mssql').VarChar,
        }))
      : [];

    const result = await executeQuery(`EXEC ${storedProcedure} ${paramArray.map(p => `@${p.name} = @${p.name}`).join(', ')}`, paramArray);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error ejecutando el stored procedure:', error);
    res.status(500).json({ error: 'Error ejecutando stored procedure' });
  }
};




// import type { NextApiRequest, NextApiResponse } from 'next';
// import { Prisma Client } from '@prisma/client';


// const prisma = new Prisma Client();

// export default async (req: NextApiRequest, res: NextApiResponse) => {
//   if (req.method === 'POST') {
//     const { storedProcedure, parameters } = req.body;
//     try {
//       //const body = await req.json();
//       console.log('en getJson storedProcedure',storedProcedure);
//       if (!storedProcedure) {
//         return res.status(400).json({ error: 'Missing stored procedure name' });
//       }

//       // Construir el query para el stored procedure
//       let query = `EXEC ${storedProcedure}`;

//       if (parameters && Object.keys(parameters).length > 0) {
//         // Construir la consulta agregando los parámetros con su nombre real
//           const paramAssignments = Object.entries(parameters)
//           .map(([paramName, paramValue]) => `${paramName}=${typeof paramValue === 'string' ? `'${paramValue}'` : paramValue}`)
//           .join(', ');        
//         // Incluir los parámetros en el query
//         //console.log('paramAssignments',paramAssignments)
//         query = `EXEC ${storedProcedure} ${paramAssignments}`;
//       }

//       // Ejecutar el stored procedure con Prisma
//       const result = await prisma.$queryRawUnsafe<any>(query);
//       res.status(200).json(result);
//     } catch (error) {
//       console.error('Error ejecutando el stored procedure:', error);
//       res.status(500).json({ error: 'Error ejecutando stored procedure' });
//     } finally {
//       await prisma.$disconnect();
//     }
//   } else {
//     res.status(405).json({ error: 'Method not allowed' }); 
//   }
// }
