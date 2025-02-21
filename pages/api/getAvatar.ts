import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { avatar } = req.query;

  if (!avatar || Array.isArray(avatar)) {
    return res.status(400).json({ error: 'Invalid avatar path' });
  }

  const filePath = path.join('D:\\files\\upload\\avatar', avatar as string);
  console.log('getAvatar',filePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Avatar not found' });
  }

  res.setHeader('Content-Type', 'image/jpeg'); // Ajustar según el tipo de archivo
  fs.createReadStream(filePath).pipe(res);
}
