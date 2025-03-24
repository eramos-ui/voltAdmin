
import { NextApiRequest, NextApiResponse } from 'next';
import { ToDoList } from '@/types/interfaces';
import { executeSP } from '@/lib/server/spExecutor';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, idProcessidActivity } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  if (!idProcessidActivity) {
    return res.status(400).json({ error: 'idProcessidActivity is required' });
  }

  try {
    const result = await executeSP<ToDoList>('N_WKF_ToDoListTaskUser', [
      { name: 'userId', type: sql.Int, value: Number(userId) },
      { name: 'idProcessidActivity', type: sql.Int, value: Number(idProcessidActivity) }
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error fetching tasks data:', error);
    res.status(500).json({ error: 'Error fetching task data' });
  }
}





// import { NextApiRequest, NextApiResponse } from 'next';
// import { Prisma Client } from '@prisma/client';
// import { ToDoList } from '@/types/interfaces';

// const prisma = new Prisma Client();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { userId, idProcessidActivity } = req.query;
//   //console.log('userId, idProcessidActivity',userId, idProcessidActivity);
//   if (!userId) {
//     return res.status(400).json({ error: 'userId is required' });
//   }
//   if (!idProcessidActivity) {
//     return res.status(400).json({ error: 'idProcessidActivity is required' });
//   }

//   try {
//     //En postman POST o GET: http://localhost:3000/api/getMenuData?userId=1
//     console.log('queryRaw todoList',`EXEC N_WKF_ToDoListTaskUser @userId=${Number(userId)}, @idProcessidActivity=${Number(idProcessidActivity)}`)
//     const query=`EXEC N_WKF_ToDoListTaskUser @userId = ${Number(userId)}, @idProcessidActivity = ${Number(idProcessidActivity)} `;//@idProcessidActivity=${Number(idProcessidActivity)}
//     const result = await prisma.$queryRawUnsafe<ToDoList>(query);
//     //Caso de resultset
//     const tasksData = JSON.parse(JSON.stringify(result));
//     res.status(200).json(tasksData)
//   } catch (error) {
//     console.error('Error fetching tasks data:', error);
//     res.status(500).json({ error: 'Error fetching task data' });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
