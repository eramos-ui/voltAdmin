import { NextApiRequest, NextApiResponse } from 'next';
import { executeQueryOne } from '@/lib/server/spExecutor'; // Ajusta la ruta si es distinta
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  const idSystem = process.env.NEXT_PUBLIC_SYSTEM;

  console.log('*** en API getMenuData idSystem', idSystem);

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const result = await executeQueryOne(
      `EXEC GetUserMenuData @userId = @userId, @idSystem = @idSystem`,
      [
        { name: 'userId', type: sql.Int, value: Number(userId) },
        { name: 'idSystem', type: sql.Int, value: Number(idSystem) },
      ]
    );

    if (!result || !result.MenuData) {
      return res.status(404).json({ error: 'No se encontró información de menú.' });
    }

    const menuData = JSON.parse(result.MenuData);
    res.status(200).json(menuData);
  } catch (error) {
    console.error('❌ Error fetching menu data:', error);
    res.status(500).json({ error: 'Error fetching menu data' });
  }
}





// import { NextApiRequest, NextApiResponse } from 'next';
// import { Prisma Client } from '@prisma/client'; 

// const prisma = new Prisma Client();  

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { userId } = req.query;
//   const idSystem=process.env.NEXT_PUBLIC_SYSTEM; 
//   console.log('*** en API getMenuData idSystem',idSystem);
//   if (!userId) {
//     return res.status(400).json({ error: 'userId is required' });
//   }

//   try {
//     const result = await prisma.$queryRaw`EXEC GetUserMenuData @userId=${Number(userId)}, @idSystem = ${Number(idSystem)}`; 
     
//     const resultArray = result as Array<{ MenuData: string }>;

//     const menuDataString = resultArray[0].MenuData;
    
//     const menuData = JSON.parse(menuDataString);
//     res.status(200).json(menuData);
//   } catch (error) {
//     console.error('Error fetching menu data:', error);
//     res.status(500).json({ error: 'Error fetching menu data' });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
