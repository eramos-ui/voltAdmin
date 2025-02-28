import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { FormConfigType } from '@/types/interfaces';
import { isJson } from '@/utils/isJson';

const prisma = new PrismaClient();

// interface StoredProcedureResult { //para el caso de que devuelve un resultSet en vez de JSON
//   formFileName: string;
//   formFilePath: string;
//   fileContent: string; // Este es el JSON en formato string
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { subMenuId } = req.query;

  if (!subMenuId || Array.isArray(subMenuId)) {
    return res.status(400).json({ error: 'Invalid subMenuId' });
  }
  try {
    //console.log('query queryRaw',`EXEC getSubMenuForm @subMenuId = ${parseInt(subMenuId, 10)}`)
    const result = await prisma.$queryRaw<{form: string}[]>
    `EXEC getSubMenuForm @subMenuId = ${Number(subMenuId)}`

   if (result  ) {
     const firstRow=result[0]; //porque supone un resulset y en el caso de json viene sólo 1 
     if (!isJson(firstRow.form)) {
       console.log('json mal formateado',firstRow.form);
      return res.status(404).json({ error: 'Json not formated' });
    }
     console.log('firstRow',(isJson(firstRow.form)));
     const formData: FormConfigType = JSON.parse(firstRow.form);
     res.status(200).json(formData);//este formData es ===  data/menu-data.json
   }else{
    return res.status(404).json({ error: 'Form not found' });
   }
    const formFileName = result
    if (!formFileName) {
      return res.status(404).json({ error: 'Form not found' });
    }
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({ error: 'Failed to load form data' });
  }
}