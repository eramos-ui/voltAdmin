
import type { NextApiRequest, NextApiResponse } from 'next';
import { executeSP } from '@/lib/server/spExecutor';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //console.log('API saveWithJson', req.body);

  if (req.method === 'POST') {
    const { storedProcedure, parameters } = req.body;
    console.log('storedProcedure, parameters', storedProcedure, parameters);

    try {
      if (!storedProcedure) {
        return res.status(400).json({ error: 'Missing stored procedure name' });
      }

      if (!parameters || typeof parameters !== 'object') {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      await executeSP(storedProcedure, [
        { name: 'jsonData', type: sql.NVarChar(sql.MAX), value: JSON.stringify(parameters) }
      ]);

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error ejecutando stored procedure:', error);

      if (error.code === 'P2010' && error.meta?.code === '50000') {
        return res.status(400).json({ error: error.meta.message });
      }

      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
