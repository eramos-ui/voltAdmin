import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { ProjectActivityType } from '@/types/interfaces';


const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });
    const { token } = req.query;
    try {
        const query=`EXEC LeeProjectActivityFromToken @token=${token} `;
        console.log('Ejectuta API leeProjectActivityFromToken');
        const result = await prisma.$queryRawUnsafe<ProjectActivityType[]>(query);
        if ( !result ){
            return res.status(404).json({ error: "Token no encontrado" });
        }
        //console.log('en API result',result, typeof result);
        const data=result[0];
        //const data = JSON.parse(JSON.stringify(result));
        res.status(200).json(data)
    } catch (error) {
        console.error('Error fetching data projectActivity:', error);
        res.status(500).json({ error: 'Error fetching projectActivity' });
    } finally {
        await prisma.$disconnect();
    }

}




