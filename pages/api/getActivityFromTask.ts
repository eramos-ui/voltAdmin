import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQueryOne } from '@/lib/server/spExecutor';
import { ActivityType } from '@/types/interfaces';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { idTask, userId } = req.query;

  if (!idTask || !userId) {
    return res.status(400).json({ error: 'idTask y userId son requeridos' });
  }

  try {
    const query = `EXEC getActivityFromTask @idTask = ${Number(idTask)}, @userId = ${Number(userId)}`;
    console.log('📦 Ejecutando consulta:', query);

    const data: ActivityType | null = await executeQueryOne(query);

    if (!data) {
      return res.status(404).json({ error: "Actividad no encontrada para la tarea" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error al obtener datos del proyecto:", error);
    res.status(500).json({ error: 'Error al obtener datos del proyecto' });
  }
}


// import { NextApiRequest, NextApiResponse } from 'next';
// import { Prisma Client } from '@prisma/client';
// import { ActivityType } from '@/types/interfaces';



// const prisma = new Prisma Client();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });
//   const { idTask ,userId} = req.query;
//   //console.log('idTask, userId',idTask, userId );
//   if (!idTask) {
//     return res.status(400).json({ error: 'idTask is required' });
//   }
//   try {
//      // 🔹 Obtener los datos generales del proyecto
//     const query=`EXEC getActivityFromTask @idTask= ${Number(idTask)}, @userId = ${Number(userId)} `;
//     const result = await prisma.$queryRawUnsafe<ActivityType[]>(query);
//     //console.log('query en getActivityFromTask',query);
//     if (!result) {
//       return res.status(404).json({ error: "Proyecto no encontrado" });
//     }
//     //console.log('result',result[0]);
//     const data=result[0];
//     res.status(200).json( data  );
//   } catch (error) {
//     console.error("❌ Error al obtener datos del proyecto:", error);
//     res.status(500).json({ error: 'Error fetching task data' });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
