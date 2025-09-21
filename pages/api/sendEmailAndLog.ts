// pages/api/sendEmailAndLog.ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { Db, GridFSBucket, ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { ProjectEmail } from "@/models/ProjectEmail";
import { finishTask, getCompletedTaskKeys, getDiagramByIdProcess } from "@/app/services/processEngine";
import { connectDB } from "@/lib/db"; // <- debe retornar la conexión Mongoose (singleton)

mongoose.set("bufferCommands", false);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Asegura protocolo en DOMAIN
const rawDomain = process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000";
const DOMAIN = rawDomain.startsWith("http") ? rawDomain : `https://${rawDomain}`;

// límites opcionales (protegen RAM/aplicación)
const MAX_ATTACH_TOTAL_BYTES = 20 * 1024 * 1024; // 20 MB sumados

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido. Usa POST." });

  try {
    // 1) Validación de entrada mínima
    const {
      sendTo,
      attachments = [],
      idProject,
      idProjectActivity,
      idActivity,
      idTask,
      idProcessInstance,
      tipoDocumento,
      nroDocumento,
      userFinish,
      attributes = {},
      finListaProveedores,
      idProcess,
      actividad,
    } = req.body ?? {};

    if (!Array.isArray(sendTo) || sendTo.length === 0) {
      return res.status(400).json({ error: "sendTo debe ser un arreglo con al menos un destinatario" });
    }
    if (!Array.isArray(attachments)) {
      return res.status(400).json({ error: "attachments debe ser un arreglo (puede ser vacío)" });
    }

    // 2) Conexión única Mongoose (y usaremos su db interna)
    await connectDB();
    const db: Db = mongoose.connection.db!;// no mezclar con import { getDatabase } from "@/lib/db";
    

    // 3) Preparar adjuntos desde GridFS (con control de errores y límite de tamaño)
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    let totalBytes = 0;
    const enrichedAttachmentsRaw = await Promise.all(
      attachments.map(async (file: any) => {
        try {
          if (!file?.fileId || !ObjectId.isValid(file.fileId)) return null;
          const fileId = new ObjectId(file.fileId);

          const fileDoc = await db.collection("uploads.files").findOne({ _id: fileId });
          if (!fileDoc) return null;

          const chunks: Buffer[] = [];
          await new Promise<void>((resolve, reject) => {
            const stream = bucket.openDownloadStream(fileId);
            stream.on("data", (chunk) => {
              totalBytes += chunk.length;
              if (totalBytes > MAX_ATTACH_TOTAL_BYTES) {
                stream.destroy(new Error("Límite de adjuntos excedido"));
                return;
              }
              chunks.push(chunk);
            });
            stream.on("end", () => resolve());
            stream.on("error", reject);
          });

          const buffer = Buffer.concat(chunks);
          return {
            fileId: file.fileId,
            fileName: file.fileName,
            fileClass: file.fileClass ?? "",
            fileType: file.fileType || "application/octet-stream",
            fileSize: fileDoc.length ?? buffer.length,
            content: buffer,
          };
        } catch (e) {
          console.error("Error preparando adjunto:", e);
          return null; // no tumba todo por 1 adjunto
        }
      })
    );

    const enrichedAttachments = (enrichedAttachmentsRaw.filter(Boolean) as Array<{
      fileName: string;
      content: Buffer;
      fileType?: string;
      fileSize?: number;
    }>);

    // 4) Envío por destinatario (paralelo controlado) + log
    const results = await Promise.allSettled(
      sendTo.map(async (to: any) => {
        // Validación mínima por destinatario
        if (!to?.email || !to?.asunto) {
          return { email: to?.email ?? null, ok: false, error: "Destinatario inválido (falta email/asunto)" };
        }

        const token = uuidv4();
        const urlCotizacion = `${DOMAIN}/cotizar?token=${encodeURIComponent(token)}`;
        const cuerpoEmail: string = to.cuerpoEmail
          ? String(to.cuerpoEmail).replace("{CotizacionURL}", urlCotizacion)
          : "No se ha definido el cuerpo del email.";

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: to.email,
          subject: to.asunto,
          html: cuerpoEmail.replace(/\n/g, "<br>"),
          attachments: enrichedAttachments.map((f) => ({
            filename: f.fileName,
            content: f.content,
            contentType: f.fileType,
          })),
        };

        // Enviar email
        await transporter.sendMail(mailOptions);

        // Guardar log
        await ProjectEmail.create({
          idProject,
          idProjectActivity,
          emailProveedor: to.email,
          nombreProveedor: to.nombreProveedor,
          contacto: to.contacto,
          idActivity,
          actividad,
          mensaje: {
            email: to.email,
            asunto: to.asunto,
            cuerpoEmail,
          },
          token,
          anexos: enrichedAttachments.map((f) => ({
            fileName: f.fileName,
            fileType: f.fileType,
            fileSize: f.fileSize ?? f.content.length,
          })),
        });

        return { email: to.email, ok: true };
      })
    );

    const summary = results.map((r) =>
      r.status === "fulfilled" ? r.value : { ok: false, error: String(r.reason) }
    );

    // 5) Finalizar tarea (si aplica). Aíslalo para no invalidar el envío.
    let finishInfo: any = null;
    if (finListaProveedores === "completada") {
      try {
        const diagram = await getDiagramByIdProcess(idProcess);
        const activityProperties = diagram.activityProperties;
        const context = { ...attributes, finListaProveedores };

        const completedKeys = await getCompletedTaskKeys(idProcessInstance);
        const activityProperty = activityProperties.find((a: any) => a.idActivity === idActivity);
        const nameActivity = activityProperty?.nameActivity ?? "";
        const currentKey = activityProperty?.key ?? "";
        const idTaskExisting = idTask;

        await finishTask(
          diagram.diagram,
          diagram.context,
          activityProperties,
          context,
          completedKeys,
          currentKey,
          userFinish,
          idProcessInstance,
          idTaskExisting,
          tipoDocumento,
          nroDocumento,
          nameActivity,
          idActivity
        );

        finishInfo = { ok: true, message: "Tarea finalizada" };
      } catch (e: any) {
        console.error("Error finalizando tarea:", e);
        finishInfo = { ok: false, message: "Envíos procesados, pero falló finishTask", error: e?.message };
      }
    }

    return res.status(200).json({
      success: true,
      results: summary,
      attachmentsStats: {
        count: enrichedAttachments.length,
        totalBytes,
        limitBytes: MAX_ATTACH_TOTAL_BYTES,
      },
      ...(finishInfo ? { finishTask: finishInfo } : {}),
    });
  } catch (error: any) {
    console.error("Error en sendEmailAndLog:", error);
    const msg = error?.message || "Error interno del servidor";
    return res.status(500).json({ error: msg });
  }
}




// //api/sendEmailAndLog
// //se usa para enviar emails y registrar los logs de los emails enviados
// import type { NextApiRequest, NextApiResponse } from "next";
// import { getDatabase } from "@/lib/db";
// import { GridFSBucket, ObjectId } from "mongodb";
// import nodemailer from "nodemailer";
// import { ProjectEmail } from "@/models/ProjectEmail";
// import { v4 as uuidv4 } from "uuid";
// import { finishTask, getCompletedTaskKeys, getDiagramByIdProcess } from "@/app/services/processEngine";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Incluye protocolo para evitar problemas en enlaces
// const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN?.startsWith("http")
//   ? process.env.NEXT_PUBLIC_DOMAIN
//   : `https://${process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000"}`;

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Método no permitido. Usa POST." });
//   }

//   try {
//     const {
//       sendTo,
//       attachments,
//       idProject,
//       idProjectActivity,
//       idActivity,
//       idTask,
//       idProcessInstance,
//       tipoDocumento,
//       nroDocumento,
//       userFinish,
//       attributes,
//       finListaProveedores,
//       idProcess,
//       actividad,
//     } = req.body;

//     if (!Array.isArray(sendTo) || !Array.isArray(attachments)) {
//       return res.status(400).json({ error: "Faltan parámetros obligatorios (sendTo, attachments)" });
//     }

//     // console.log('en API api/sendEmailAndLog')
//     const db = await getDatabase();
//     // 1) Preparar adjuntos desde GridFS
//     const enrichedAttachmentsRaw = await Promise.all(
//       attachments.map(async (file: any) => {
//         try {
//           const fileId = ObjectId.createFromHexString(file.fileId);
//           const fileDoc = await db.collection("uploads.files").findOne({ _id: fileId });
//           if (!fileDoc) return null;

//           const chunks: Buffer[] = [];
//           const bucket = new GridFSBucket(db, { bucketName: "uploads" });
//           const stream = bucket.openDownloadStream(fileId);

//           return await new Promise<any>((resolve, reject) => {
//             stream.on("data", (chunk) => chunks.push(chunk));
//             stream.on("end", () => {
//               resolve({
//                 fileId: file.fileId,
//                 fileName: file.fileName,
//                 fileClass: file.fileClass ?? "",
//                 fileType: file.fileType || "application/octet-stream",
//                 fileSize: fileDoc.length ?? 0,
//                 content: Buffer.concat(chunks),
//               });
//             });
//             stream.on("error", (err) => {
//               console.error(`Error leyendo archivo ${file.fileName} desde GridFS:`, err);
//               resolve(null); // evitamos romper todo el envío por 1 archivo
//             });
//           });
//         } catch (e) {
//           console.error("Error preparando adjunto:", e);
//           return null;
//         }
//       })
//     );

//     // ⚠️ 2) Filtrar adjuntos nulos
//     const enrichedAttachments = enrichedAttachmentsRaw.filter(Boolean) as Array<{
//       fileName: string;
//       content: Buffer;
//       fileType?: string;
//     }>;

//     // 3) Enviar correos (uno por destinatario)
//     for (const to of sendTo) {
//       const token = uuidv4();
//       const urlCotizacion = `${DOMAIN}/cotizar?token=${encodeURIComponent(token)}`;
//       const cuerpoEmail: string = to.cuerpoEmail
//         ? String(to.cuerpoEmail).replace("{CotizacionURL}", urlCotizacion)
//         : "No se ha definido el cuerpo del email.";

//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: to.email,
//         subject: to.asunto,
//         html: cuerpoEmail.replace(/\n/g, "<br>"),
//         attachments: enrichedAttachments.map((f) => ({
//           filename: f.fileName,
//           content: f.content,
//           contentType: f.fileType,
//         })),
//       };

//       try {
//         await transporter.sendMail(mailOptions);

//         // Log
//         const newLog = new ProjectEmail({
//           idProject,
//           idProjectActivity,
//           emailProveedor: to.email,
//           nombreProveedor: to.nombreProveedor,
//           contacto: to.contacto,
//           idActivity,
//           actividad,
//           mensaje: {
//             email: to.email,
//             asunto: to.asunto,
//             cuerpoEmail,
//           },
//           token,
//           anexos: enrichedAttachments.map((f) => ({
//             fileName: f.fileName,
//             fileType: f.fileType,
//             // Ojo: si no quieres guardar el binario en Mongo, no guardes content aquí
//             fileSize: f.content?.length ?? 0,
//           })),
//         });
//         // console.log('en API api/sendEmailAndLog newLog',newLog)
//         await newLog.save();
//       } catch (error) {
//         console.error(`Error al enviar email a ${to.email}:`, error);
//         // Seguimos con los demás destinatarios; si quieres fallar toda la request, lanza el error aquí.
//       }
//     }
//     // 4) Si hay que finalizar tarea, hazlo y responde 200
//     if (finListaProveedores === "completada") {
//       const diagram = await getDiagramByIdProcess(idProcess);
//       const activityProperties = diagram.activityProperties;
//       const context = { ...attributes, finListaProveedores };

//       const completedKeys = await getCompletedTaskKeys(idProcessInstance);
//       const activityProperty = activityProperties.find((a: any) => a.idActivity === idActivity);
//       const nameActivity = activityProperty?.nameActivity ?? "";
//       const currentKey = activityProperty?.key ?? "";
//       const idTaskExisting = idTask;

//       await finishTask(
//         diagram.diagram,
//         diagram.context,
//         activityProperties,
//         context,
//         completedKeys,
//         currentKey,
//         userFinish,
//         idProcessInstance,
//         idTaskExisting,
//         tipoDocumento,
//         nroDocumento,
//         nameActivity,
//         idActivity
//       );

//       return res.status(200).json({ success: true, message: "Emails enviados y tarea finalizada" });
//     }

//     // ✅ 5) SIEMPRE responder algo cuando no se finaliza la tarea
//     return res.status(200).json({ success: true, message: "Emails enviados" });
//   } catch (error) {
//     console.error("Error en sendEmailAndLog:", error);
//     return res.status(500).json({ error: "Error interno del servidor" });
//   }
// }
