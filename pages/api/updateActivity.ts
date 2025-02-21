
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { values,  userModification:usuarioModificacion } = req.body;
 
  try {
    // 🔹 1️⃣ Iniciar Transacción con Prisma
    const result = await prisma.$transaction(async (prisma) => {

    // 🔹 2️⃣ Guardar datos del formulario (`values`)
    const updatedValues = {
        ...values,
        usuarioModificacion,
     };
    const utf8Data = Buffer.from(JSON.stringify(updatedValues), 'utf8').toString();
    const result:any = await prisma.$queryRawUnsafe(
      `EXEC updateActivity @jsonData = N'${utf8Data}'`
    );
    const idProject=result[0].idProject;
   
    if (idProject ) console.log("✅ Proyecto guardado correctamente.",idProject);
      return idProject;
    },{ timeout: 50000 });//50 segundos para la transacción
    res.status(200).json({ message: "Actividad guardada con éxito", idProject: result });


  } catch (error) {
    console.error("❌ Error al guardar en Prisma:", error);
    res.status(500).json({ error: "Error al guardar proyecto" });
  }
}
