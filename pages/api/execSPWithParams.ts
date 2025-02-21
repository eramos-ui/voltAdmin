import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });
  const { storedProcedure ,parameters} = req.body;
  console.log('API execSPWithParams',req.body);

  console.log('storedProcedure ,params',storedProcedure ,parameters );
  res.status(200).json( {}  );
  if (!storedProcedure) {
    return res.status(400).json({ error: 'storedProcedure is required' });
  }
  let query = `EXEC ${storedProcedure}`;
  try {
    if (parameters && Object.keys(parameters).length > 0) {
      const paramAssignments = Object.entries(parameters)
      .map(([paramName, paramValue]) => `${paramName}=${typeof paramValue === 'string' ? `'${paramValue}'` : paramValue}`)
      .join(', ');  
      //query = `EXEC ${storedProcedure} ${paramAssignments}`;
      query=`EXEC ${storedProcedure}  ${paramAssignments} `; 
      console.log('query',query);
      const result=await prisma.$queryRaw`EXEC ${storedProcedure}  ${paramAssignments} `;
      res.status(200).json(result);
    }else{
      const result=await prisma.$queryRaw`EXEC ${storedProcedure} `;
      res.status(200).json(result);
    }

    //const result = await prisma.$queryRaw`EXEC GetUserMenuData @userId=${Number(userId)}, @idSystem = ${Number(idSystem)}`; 
    //const data=result;
    //res.status(200).json(data);
    // 🔹 Obtener los datos generales del proyecto
   //console.log('queryRaw loadProject',`EXEC getProjectFromTask @idTask=${Number(idTask)}`)//En postman POST o GET: http://localhost:3000/api/getLoadProject?idTask=9
   //  query = `EXEC ${storedProcedure} ${paramAssignments}`;
   //const query=`EXEC getActivityFromTask @idTask= ${Number(idTask)}, @userId = ${Number(userId)} `;
  
   // if (!result) {
   //   return res.status(404).json({ error: "Proyecto no encontrado" });
   // }
   
   //console.log('result',result[0]);
   
   //res.status(200).json(  data   );
  
  } catch (error) {
    console.error("❌ Error al obtener datos:", error);
    res.status(500).json({ error: 'Error fetching  data' });
  } finally {
    await prisma.$disconnect();
  }
    
}
