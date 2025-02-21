import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { storedProcedure, parameters } = req.body;
    try {
      //const body = await req.json();
      console.log('en getJson storedProcedure',storedProcedure);
      if (!storedProcedure) {
        return res.status(400).json({ error: 'Missing stored procedure name' });
      }

      // Construir el query para el stored procedure
      let query = `EXEC ${storedProcedure}`;

      if (parameters && Object.keys(parameters).length > 0) {
        // Construir la consulta agregando los parámetros con su nombre real
          const paramAssignments = Object.entries(parameters)
          .map(([paramName, paramValue]) => `${paramName}=${typeof paramValue === 'string' ? `'${paramValue}'` : paramValue}`)
          .join(', ');        
        // Incluir los parámetros en el query
        //console.log('paramAssignments',paramAssignments)
        query = `EXEC ${storedProcedure} ${paramAssignments}`;
      }

      // Ejecutar el stored procedure con Prisma
      const result = await prisma.$queryRawUnsafe<any>(query);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error ejecutando el stored procedure:', error);
      res.status(500).json({ error: 'Error ejecutando stored procedure' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' }); 
  }
}
