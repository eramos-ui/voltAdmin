

import { NextApiRequest, NextApiResponse } from 'next';
import { executeSP } from '@/lib/server/spExecutor';
import sql from 'mssql';
import { ProjectActivityType } from '@/types/interfaces';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { token } = req.query;

  if (!token || Array.isArray(token)) {
    return res.status(400).json({ error: "Token inválido o faltante" });
  }

  try {
    const result = await executeSP<ProjectActivityType>('LeeProjectActivityFromToken', [
      { name: 'token', type: sql.VarChar, value: token }
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Token no encontrado" });
    }

    const data = result[0];
    res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error fetching data projectActivity:', error);
    res.status(500).json({ error: 'Error fetching projectActivity' });
  }
}


// import { NextApiRequest, NextApiResponse } from 'next';
// import { Prisma Client } from '@prisma/client';
// import { ProjectActivityType } from '@/types/interfaces';


// const prisma = new Prisma Client();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });
//     const { token } = req.query;
//     try {
//         const query=`EXEC LeeProjectActivityFromToken @token=${token} `;
//         console.log('Ejectuta API leeProjectActivityFromToken');
//         const result = await prisma.$queryRawUnsafe<ProjectActivityType[]>(query);
//         if ( !result ){
//             return res.status(404).json({ error: "Token no encontrado" });
//         }
//         //console.log('en API result',result, typeof result);
//         const data=result[0];
//         //const data = JSON.parse(JSON.stringify(result));
//         res.status(200).json(data)
//     } catch (error) {
//         console.error('Error fetching data projectActivity:', error);
//         res.status(500).json({ error: 'Error fetching projectActivity' });
//     } finally {
//         await prisma.$disconnect();
//     }

// }




