//api/sendEmailAndLog
//se usa para enviar emails y registrar los logs de los emails enviados
import type { NextApiRequest, NextApiResponse } from "next";
import { getDatabase } from "@/lib/db";
import { GridFSBucket, ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import { ProjectEmail } from "@/models/ProjectEmail";
import { v4 as uuidv4 } from "uuid";
import { finishTask, getCompletedTaskKeys, getDiagramByIdProcess } from "@/app/services/processEngine";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Incluye protocolo para evitar problemas en enlaces
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN?.startsWith("http")
  ? process.env.NEXT_PUBLIC_DOMAIN
  : `https://${process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000"}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  try {
    const {
      sendTo,
      attachments,
      idProject,
      idProjectActivity,
      idActivity,
      idTask,
      idProcessInstance,
      tipoDocumento,
      nroDocumento,
      userFinish,
      attributes,
      finListaProveedores,
      idProcess,
      actividad,
    } = req.body;

    if (!Array.isArray(sendTo) || !Array.isArray(attachments)) {
      return res.status(400).json({ error: "Faltan parámetros obligatorios (sendTo, attachments)" });
    }

    const db = await getDatabase();

    // 1) Preparar adjuntos desde GridFS
    const enrichedAttachmentsRaw = await Promise.all(
      attachments.map(async (file: any) => {
        try {
          const fileId = ObjectId.createFromHexString(file.fileId);
          const fileDoc = await db.collection("uploads.files").findOne({ _id: fileId });
          if (!fileDoc) return null;

          const chunks: Buffer[] = [];
          const bucket = new GridFSBucket(db, { bucketName: "uploads" });
          const stream = bucket.openDownloadStream(fileId);

          return await new Promise<any>((resolve, reject) => {
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("end", () => {
              resolve({
                fileId: file.fileId,
                fileName: file.fileName,
                fileClass: file.fileClass ?? "",
                fileType: file.fileType || "application/octet-stream",
                fileSize: fileDoc.length ?? 0,
                content: Buffer.concat(chunks),
              });
            });
            stream.on("error", (err) => {
              console.error(`Error leyendo archivo ${file.fileName} desde GridFS:`, err);
              resolve(null); // evitamos romper todo el envío por 1 archivo
            });
          });
        } catch (e) {
          console.error("Error preparando adjunto:", e);
          return null;
        }
      })
    );

    // ⚠️ 2) Filtrar adjuntos nulos
    const enrichedAttachments = enrichedAttachmentsRaw.filter(Boolean) as Array<{
      fileName: string;
      content: Buffer;
      fileType?: string;
    }>;

    // 3) Enviar correos (uno por destinatario)
    for (const to of sendTo) {
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

      try {
        await transporter.sendMail(mailOptions);

        // Log
        const newLog = new ProjectEmail({
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
            // Ojo: si no quieres guardar el binario en Mongo, no guardes content aquí
            fileSize: f.content?.length ?? 0,
          })),
        });
        await newLog.save();
      } catch (error) {
        console.error(`Error al enviar email a ${to.email}:`, error);
        // Seguimos con los demás destinatarios; si quieres fallar toda la request, lanza el error aquí.
      }
    }

    // 4) Si hay que finalizar tarea, hazlo y responde 200
    if (finListaProveedores === "completada") {
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

      return res.status(200).json({ success: true, message: "Emails enviados y tarea finalizada" });
    }

    // ✅ 5) SIEMPRE responder algo cuando no se finaliza la tarea
    return res.status(200).json({ success: true, message: "Emails enviados" });
  } catch (error) {
    console.error("Error en sendEmailAndLog:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}


// import type { NextApiRequest, NextApiResponse } from "next";
// import { getDatabase } from "@/lib/db";
// import {  GridFSBucket, ObjectId } from "mongodb";
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
// const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Método no permitido. Usa POST." });
//   }

//   try {
//     const { sendTo, attachments, idProject, idProjectActivity, idActivity,  idTask, idProcessInstance, tipoDocumento,
//        nroDocumento, userFinish, attributes, nameActivity, finListaProveedores,idProcess,actividad  } = req.body;
//     // console.log('sendEmailAndLog idProject, idProjectActivity, idActivity, idTask, idProcessInstance, tipoDocumento, nroDocumento ',idProject, idProjectActivity, idActivity, idTask, idProcessInstance, tipoDocumento, nroDocumento);
//     if (!sendTo || !attachments) {
//       return res.status(400).json({ error: "Faltan parámetros obligatorios" });
//     }
// // console.log('en sendEmailAndLog attachments',attachments)
//     const db = await getDatabase(); 
//     const enrichedAttachments = await Promise.all(//prepara los archivos adjuntos para el email
//       attachments.map(async (file: any) => {
//         const fileDoc = await db.collection("uploads.files").findOne({ _id: ObjectId.createFromHexString(file.fileId) });//este es uploads.files
//         if (!fileDoc) return null;
//         // ⚠️ Aquí debes leer el contenido del archivo desde GridFS
//         const chunks: Buffer[] = [];
//         const bucket = new GridFSBucket(db, { bucketName: "uploads" });
//         const stream = bucket.openDownloadStream(ObjectId.createFromHexString(file.fileId));//busca el archivo en el bucket(en uploads.chunks)
//         //console.log('en attachement.map stream ',stream)    
//         return new Promise((resolve, reject) => {
//           stream.on('data', (chunk) => chunks.push(chunk));
//           stream.on('end', () => {
//             resolve({
//               fileId: file.fileId,
//               fileName: file.fileName,
//               fileClass: file.fileClass ?? '',
//               fileType: file.fileType,
//               fileSize: fileDoc.length ?? 0,
//               content: Buffer.concat(chunks), // ✅ este es el contenido real
//             });
//           });
//           stream.on('error', (err) => {
//             console.error(`Error leyendo archivo ${file.fileName} desde GridFS:`, err);
//             resolve(null); // o reject(err);
//           });
//         });
//       })
//     );
//     //  console.log('enrichedAttachments ',enrichedAttachments)
//     // Enviar Email
//     for (const to of sendTo) {
//       const token = uuidv4(); // ✅ Generar un token único por proveedor
//        // Construir la URL de cotización
//       const urlCotizacion = `${DOMAIN}/cotizar?token=${encodeURIComponent(token)}`;
//       console.log('sendEmailAndLog urlCotizacion-token',urlCotizacion,token);
//       const cuerpoEmail = to.cuerpoEmail
//         ? to.cuerpoEmail.replace("{CotizacionURL}", urlCotizacion)
//         : "No se ha definido el cuerpo del email.";
//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: to.email,
//         subject: to.asunto,
//         html: cuerpoEmail.replace(/\n/g, "<br>"),
//         attachments: enrichedAttachments.map((file: any) => ({
//           filename: file.fileName,
//           content: file.content, // ✅ este es el Buffer con el contenido real
//           contentType: file.fileType,
//         })),
//       };
//       // console.log('sendEmailAndLog mailOptions',mailOptions)      
//       try{
//         await transporter.sendMail(mailOptions);
//         //Registrar el log del email enviado
//         const newLog = new ProjectEmail({
//           idProject,
//           idProjectActivity,
//           emailProveedor: to.email,
//           nombreProveedor: to.nombreProveedor,   
//           contacto: to.contacto,
//           idActivity: idActivity,
//           actividad,//nombre de la actividad
//           mensaje: {
//             email: to.email,
//             asunto: to.asunto,
//             cuerpoEmail,
//           },
//           token: token,
//           anexos: enrichedAttachments,
//         });
//         await newLog.save();
//         } catch (error) {
//           console.error(`Error al enviar email a ${to.email}:`, error);
//         }
//      }
//      if (finListaProveedores === 'completada') {
//       //console.log('sendEmailAndLog finListaProveedores',finListaProveedores,idProcessInstance,idActivity);      
//       // ✅ Invocar la API `/api/process/finish-task` después del envío y registro
//       const diagram = await getDiagramByIdProcess(idProcess);
//       const activityProperties = diagram.activityProperties;
//       const context = { ...attributes,finListaProveedores }; //río de datos
//       // console.log('en sendEmailAndLog context',context);
//       const completedKeys = await getCompletedTaskKeys(idProcessInstance);
//       // const activityProperty = await getActivityPropertiesByIdTask(idTaskExisting);
//       const activityProperty = activityProperties.find((activity:any) => activity.idActivity === idActivity);
//       const nameActivity = activityProperty?.nameActivity ?? '';

//       const currentKey = activityProperty?.key ?? ''; 
//       // console.log('en sendEmailAndLog idActivity',idActivity,context,tipoDocumento,nroDocumento); 
//       const idTaskExisting = idTask;
//       // // console.log('en saveProject antes de finishTask',idProcessInstance); 
//       await finishTask(
//         diagram.diagram,//que tiene los connectors, shapes y las pages attributes-dibujo 
//         diagram.context,//que contiene los atributos del diagrama del proceso (río de datos)            
//         activityProperties,//que tiene las propiedades de las actividades y se relaciona con las shapes vía [key]
//         context,//que tiene los atributos del process (ría de datos)
//         completedKeys,//que tiene las keys de las actividades/shapes ya completadas
//         currentKey,//que tiene la key de la actividad actual
//         userFinish,//que tiene el usuario que finalizó la actividad
//         idProcessInstance,//que tiene el id del instancia del proceso
//         idTaskExisting,//que tiene la task
//         tipoDocumento,
//         nroDocumento,
//         nameActivity,
//         idActivity
//       );
//       return res.status(200).json({ success: true, message: 'Emails enviados y tarea finalizada' });
//      }
//   } catch (error) {
//     console.error("Error en sendEmailAndLog:", error);
//     return res.status(500).json({ error: "Error interno del servidor" });
//   }
// }