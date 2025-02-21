
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'; 

const prisma = new PrismaClient();  

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  const idSystem=process.env.NEXT_PUBLIC_SYSTEM; 
  console.log('*** en API getMenuData idSystem',idSystem);
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    //console.log('queryRaw menu',`EXEC GetUserMenuData @userId=${Number(userId)}, @idSystem = ${Number(idSystem)}`)//En postman POST o GET: http://localhost:3000/api/getMenuData?userId=1
    const result = await prisma.$queryRaw`EXEC GetUserMenuData @userId=${Number(userId)}, @idSystem = ${Number(idSystem)}`; 
     
    const resultArray = result as Array<{ MenuData: string }>;

    const menuDataString = resultArray[0].MenuData;
    
    const menuData = JSON.parse(menuDataString);
    //console.log('En getMenuData', menuData);
    res.status(200).json(menuData);
  } catch (error) {
    console.error('Error fetching menu data:', error);
    res.status(500).json({ error: 'Error fetching menu data' });
  } finally {
    await prisma.$disconnect();
  }
}
