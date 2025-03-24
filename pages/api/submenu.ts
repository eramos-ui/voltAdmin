import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/server/spExecutor';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { subMenuId } = req.query;

    if (!subMenuId || Array.isArray(subMenuId)) {
      return res.status(400).json({ error: 'Missing or invalid subMenuId parameter' });
    }

    try {
      const result = await executeQuery<{ form: string }>(
        'SELECT form FROM subMenu WHERE id = @subMenuId',
        [
          { name: 'subMenuId', type: sql.Int, value: parseInt(subMenuId, 10) },
        ]
      );

      if (!result || result.length === 0 || !result[0].form) {
        return res.status(404).json({ error: 'SubMenu not found or no form associated' });
      }

      return res.status(200).json({ form: result[0].form });
    } catch (error) {
      console.error('Error fetching subMenu form:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}




// import { NextApiRequest, NextApiResponse } from 'next';
// import { Prisma Client } from '@prisma/client';

// const prisma = new Prisma Client(); 

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'GET') {
//     const { subMenuId } = req.query;

//     if (!subMenuId) {
//       return res.status(400).json({ error: 'Missing subMenuId parameter' });
//     }

//     try {
//       const subMenu = await prisma.subMenu.findUnique({
//         where: { id: parseInt(subMenuId as string, 10) },
//         select: { form: true },
//       });

//       if (!subMenu || !subMenu.form) {
//         return res.status(404).json({ error: 'SubMenu not found or no form associated' });
//       }

//       return res.status(200).json({ form: subMenu.form });
//     } catch (error) {
//       console.error('Error fetching subMenu form:', error);
//       return res.status(500).json({ error: 'Internal server error' });
//     } finally {
//       await prisma.$disconnect();
//     }
//   } else {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }
// }
