import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQueryOne } from '@/lib/server/spExecutor';
import sql from 'mssql';
import { FormConfigType } from '@/types/interfaces';
import { isJson } from '@/utils/isJson';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { subMenuId } = req.query;

  if (!subMenuId || Array.isArray(subMenuId)) {
    return res.status(400).json({ error: 'Invalid subMenuId' });
  }

  try {
    const result = await executeQueryOne(
      `EXEC getSubMenuForm @subMenuId = @subMenuId`,
      [
        { name: 'subMenuId', type: sql.Int, value: Number(subMenuId) },
      ]
    );

    if (!result || !result.form) {
      return res.status(404).json({ error: 'Form not found or empty' });
    }

    if (!isJson(result.form)) {
      console.warn('⚠️ Json mal formateado recibido desde el SP:', result.form);
      return res.status(400).json({ error: 'Form JSON is not properly formatted' });
    }

    const formData: FormConfigType = JSON.parse(result.form);
    res.status(200).json(formData);
  } catch (error) {
    console.error('❌ Error fetching form data:', error);
    res.status(500).json({ error: 'Failed to load form data' });
  }
}



// import type { NextApiRequest, NextApiResponse } from 'next';
// import { Prisma Client } from '@prisma/client';
// import { FormConfigType } from '@/types/interfaces';
// import { isJson } from '@/utils/isJson';

// const prisma = new Prisma Client();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { subMenuId } = req.query;

//   if (!subMenuId || Array.isArray(subMenuId)) {
//     return res.status(400).json({ error: 'Invalid subMenuId' });
//   }
//   try {
//     //console.log('query queryRaw',`EXEC getSubMenuForm @subMenuId = ${parseInt(subMenuId, 10)}`)
//     const result = await prisma.$queryRaw<{form: string}[]>
//     `EXEC getSubMenuForm @subMenuId = ${Number(subMenuId)}`

//    if (result  ) {
//      const firstRow=result[0]; //porque supone un resulset y en el caso de json viene sólo 1 
//      if (!isJson(firstRow.form)) {
//        console.log('json mal formateado',firstRow.form);
//       return res.status(404).json({ error: 'Json not formated' });
//     }
//      console.log('firstRow',(isJson(firstRow.form)));
//      const formData: FormConfigType = JSON.parse(firstRow.form);
//      res.status(200).json(formData);//este formData es ===  data/menu-data.json
//    }else{
//     return res.status(404).json({ error: 'Form not found' });
//    }
//     const formFileName = result
//     if (!formFileName) {
//       return res.status(404).json({ error: 'Form not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching form data:', error);
//     res.status(500).json({ error: 'Failed to load form data' });
//   }
// }