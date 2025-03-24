import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/server/spExecutor';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { storedProcedure, parameters } = req.body;
  console.log('📥 API execSPWithParams', req.body);

  if (!storedProcedure) {
    return res.status(400).json({ error: 'storedProcedure is required' });
  }

  try {
    // Construcción segura del query con parámetros
    let query = `EXEC ${storedProcedure}`;

    if (parameters && Object.keys(parameters).length > 0) {
      const paramAssignments = Object.entries(parameters)
        .map(([key, value]) =>
          `${key} = ${typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value}`
        )
        .join(', ');

      query += ` ${paramAssignments}`;
    }

    console.log('🧪 Query generado:', query);

    const result = await executeQuery(query);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error al ejecutar stored procedure:', error);
    res.status(500).json({ error: 'Error ejecutando stored procedure' });
  }
}


// import { NextApiRequest, NextApiResponse } from 'next';
// import { Prisma Client } from '@prisma/client';

// const prisma = new Prisma Client();

// export default async (req: NextApiRequest, res: NextApiResponse) => {
//   //if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });
//   const { storedProcedure ,parameters} = req.body;
//   console.log('API execSPWithParams',req.body);

//   console.log('storedProcedure ,params',storedProcedure ,parameters );
//   res.status(200).json( {}  );
//   if (!storedProcedure) {
//     return res.status(400).json({ error: 'storedProcedure is required' });
//   }
//   let query = `EXEC ${storedProcedure}`;
//   try {
//     if (parameters && Object.keys(parameters).length > 0) {
//       const paramAssignments = Object.entries(parameters)
//       .map(([paramName, paramValue]) => `${paramName}=${typeof paramValue === 'string' ? `'${paramValue}'` : paramValue}`)
//       .join(', ');  
//       //query = `EXEC ${storedProcedure} ${paramAssignments}`;
//       query=`EXEC ${storedProcedure}  ${paramAssignments} `; 
//       console.log('query',query);
//       const result=await prisma.$queryRaw`EXEC ${storedProcedure}  ${paramAssignments} `;
//       res.status(200).json(result);
//     }else{
//       const result=await prisma.$queryRaw`EXEC ${storedProcedure} `;
//       res.status(200).json(result);
//     }
  
//   } catch (error) {
//     console.error("❌ Error al obtener datos:", error);
//     res.status(500).json({ error: 'Error fetching  data' });
//   } finally {
//     await prisma.$disconnect();
//   }
    
// }
