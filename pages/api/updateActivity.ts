
import type { NextApiRequest, NextApiResponse } from 'next';
import { executeSPScalar } from '@/lib/server/spExecutor';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { values, userModification: usuarioModificacion } = req.body;

  try {
    const updatedValues = {
      ...values,
      usuarioModificacion,
    };

    const utf8Data = Buffer.from(JSON.stringify(updatedValues), 'utf8').toString();

    const result = await executeSPScalar('updateActivity', [
      { name: 'jsonData', type: sql.NVarChar(sql.MAX), value: utf8Data }
    ]);

    const idProject = result;

    if (idProject) console.log("✅ Proyecto guardado correctamente.", idProject);

    res.status(200).json({ message: "Actividad guardada con éxito", idProject });
  } catch (error) {
    console.error("❌ Error al guardar en base de datos:", error);
    res.status(500).json({ error: "Error al guardar proyecto" });
  }
}






// import { NextApiRequest, NextApiResponse } from "next";
// import { Prisma Client } from "@prisma/client";


// const prisma = new Prisma Client();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

//   const { values,  userModification:usuarioModificacion } = req.body;
 
//   try {
//     // 🔹 1️⃣ Iniciar Transacción con Prisma
//     const result = await prisma.$transaction(async (prisma) => {

//     // 🔹 2️⃣ Guardar datos del formulario (`values`)
//     const updatedValues = {
//         ...values,
//         usuarioModificacion,
//      };
//     const utf8Data = Buffer.from(JSON.stringify(updatedValues), 'utf8').toString();
//     const result:any = await prisma.$queryRawUnsafe(
//       `EXEC updateActivity @jsonData = N'${utf8Data}'`
//     );
//     const idProject=result[0].idProject;
   
//     if (idProject ) console.log("✅ Proyecto guardado correctamente.",idProject);
//       return idProject;
//     },{ timeout: 50000 });//50 segundos para la transacción
//     res.status(200).json({ message: "Actividad guardada con éxito", idProject: result });


//   } catch (error) {
//     console.error("❌ Error al guardar en Prisma:", error);
//     res.status(500).json({ error: "Error al guardar proyecto" });
//   }
// }
