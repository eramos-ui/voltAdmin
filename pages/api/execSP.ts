import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { storedProcedure, parameters } = req.body;
    console.log('execSP storedProcedure, parameters',storedProcedure, parameters)
    try {
      if (!storedProcedure) {
        return res.status(400).json({ error: 'Missing stored procedure name' });
      }
      // Construir la llamada al stored procedure con sus parámetros
      let query = `EXEC ${storedProcedure}`;

      //let paramAssignments='';
      if (parameters && Object.keys(parameters).length > 0) {
        // Construir la consulta agregando los parámetros con su nombre real
          const paramAssignments = Object.entries(parameters)
          .map(([paramName, paramValue]) => `${paramName}=${typeof paramValue === 'string' ? `'${paramValue}'` : paramValue}`)
          .join(', ');        
        // Incluir los parámetros en el query
        //console.log('paramAssignments',paramAssignments)

        query = `EXEC ${storedProcedure} ${paramAssignments}`;
      }
      //console.log('Query to execute***:', query);
      // Ejecutar el stored procedure utilizando Prisma
      const result=await prisma.$queryRawUnsafe(query);
      //console.log('result en execSP',result)
      res.status(200).json(result);
    } catch (error) {
      console.error('Error ejecutando stored procedure:', error);
      res.status(500).json({ error: 'Error ejecutando stored procedure' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
 