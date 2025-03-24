
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { executeSP, executeSPScalar } from '@/lib/server/spExecutor';
import sql from 'mssql';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { values, excelFile, kmlFile, empalmesGrid, instalacionesGrid, techoGrid, userId, state } = req.body;
  try {
    const updatedValues = {
      ...values,
      userId: String(userId),
      state,
    };
    const utf8Data = Buffer.from(JSON.stringify(updatedValues), 'utf8').toString();

    const saveResult = await executeSPScalar('UpdateProject', [
      { name: 'jsonData', type: sql.NVarChar(sql.MAX), value: utf8Data }
    ]);
    const idProject = saveResult?.idProject;
    if (!idProject) throw new Error('No se pudo guardar el proyecto.');

    const saveFileToDB = async (file: any, key: string) => {
      if (!file || !file.fileName) return;
      const existsResp = await executeSPScalar('isFileAlredyUploaded', [
        { name: 'jsonData', type: sql.NVarChar(sql.MAX), value: JSON.stringify({ idProject, userId: String(userId), fileName: file.fileName }) }
      ]);
      if (existsResp?.existe === 'true') return;

      const fileBuffer = Buffer.from(file.fileData, "base64");
      const fileContent = fileBuffer.toString("utf-8");

      const fileData = {
        idProject,
        fileClass: key,
        userId: String(userId),
        rowId: '',
        fileName: file.fileName,
        fileType: file.fileType,
        fileData: file.fileType !== "application/vnd.google-earth.kml+xml" ? fileBuffer : null,
        fileContent: file.fileType === "application/vnd.google-earth.kml+xml" ? fileContent : null,
      };

      await executeSP('UpdateProjectFile', [
        { name: 'jsonData', type: sql.NVarChar(sql.MAX), value: Buffer.from(JSON.stringify(fileData), 'utf8').toString() }
      ]);
    };

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const saveFileToFS = async (idProject: number, file: any, key: string, rowId: string) => {
      if (!file) return;
      const existsResp = await executeSPScalar('isFileAlredyUploaded', [
        { name: 'jsonData', type: sql.NVarChar(sql.MAX), value: JSON.stringify({ idProject, userId: String(userId), fileName: file.fileName }) }
      ]);
      if (existsResp?.existe === 'true') return;

      const fileExtension = path.extname(file.fileName);
      const uniqueFileName = `${uuidv4()}_${userId}${fileExtension}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      const fileBuffer = Buffer.from(file.fileData, "base64");
      fs.writeFileSync(filePath, fileBuffer);

      const fileData = {
        idProject,
        fileClass: key,
        userId: String(userId),
        fileName: file.fileName,
        fileType: file.fileType,
        rowId,
        filePath,
      };

      await executeSP('UpdateProjectFile', [
        { name: 'jsonData', type: sql.NVarChar(sql.MAX), value: JSON.stringify(fileData) }
      ]);
    };

    await Promise.all([saveFileToDB(kmlFile, 'KML'), saveFileToDB(excelFile, 'Activities')]);

    const uploadFilesFromGrid = async (grid: any[], fileKeys: string[], rowIdKey: string | string[]) => {
      for (const row of grid) {
        const rowId = Array.isArray(rowIdKey)
          ? rowIdKey.map((key) => String(row[key])).join("_")
          : String(row[rowIdKey]);

        await Promise.all(
          fileKeys.map(async (key: string) => {
            const file = row[key];
            if (!file || !file.fileType) return;
            if (["application/pdf", "image/jpeg"].includes(file.fileType)) {
              return saveFileToFS(idProject, file, key, rowId);
            } else {
              return saveFileToDB(file, key);
            }
          })
        );
      }
    };

    await Promise.all([
      uploadFilesFromGrid(empalmesGrid, ["rutCliente", "boleta", "poder", "f2", "diagrama", "otrasImagenes"], "nroEmpalme"),
      uploadFilesFromGrid(instalacionesGrid, ["memoriaCalculo"], "nroInstalacion"),
      uploadFilesFromGrid(techoGrid, ["imagenTecho"], ["nroInstalacion", "nroAgua"]),
    ]);

    res.status(200).json({ message: "Proyecto y archivos guardados con éxito", idProject });
  } catch (error) {
    console.error("❌ Error al guardar en base de datos:", error);
    res.status(500).json({ error: "Error al guardar proyecto" });
  }
}




// import { NextApiRequest, NextApiResponse } from "next";
// import { Prisma Client } from "@prisma/client";
// import fs from "fs";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";

// const prisma = new Prisma Client();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

//   const { values, excelFile, kmlFile, empalmesGrid, instalacionesGrid, techoGrid, userId, state } = req.body;
//   try {
//     // 🔹 1️⃣ Iniciar Transacción con Prisma
//     const result = await prisma.$transaction(async (prisma) => {
//      // 📌 Diccionario de reemplazo de claves- quitar los tildes en las llaves y car. especiales

//     // 🔹 2️⃣ Guardar datos del formulario (`values`)
//     const updatedValues = {
//         ...values,
//         userId:String(userId),
//         state,
//     };
//     //console.log('updatedValues', `EXEC UpdateProject @jsonData = N'${JSON.stringify(updatedValues)}'`);
//     const utf8Data = Buffer.from(JSON.stringify(values), 'utf8').toString();
//     console.log('utf8Data',utf8Data);
//     const result:any = await prisma.$queryRawUnsafe(
//       // `EXEC UpdateProject @jsonData = N'${JSON.stringify(updatedValues)}'`
//       `EXEC UpdateProject @jsonData = N'${utf8Data}'`
//     );
//     const idProject=result[0].idProject;
   
//     if (idProject ) console.log("✅ Proyecto guardado correctamente.",idProject); 
//     // 🔹 3️⃣ Función para guardar archivos pequeños (`Excel`, `KML`) en la BD
//       const saveFileToDB = async ( file: any, key:string) => {
//         if (!file || !file.fileName) return;
//         //console.log('en saveFileToDB',file.fileName, key,file.fileType);

//       // 🔹 Verificar si ya existe antes de subirlo
//         const updatedValues={idProject, userId:String(userId), fileName:file.fileName };
//         const resp:any = await prisma.$queryRawUnsafe(
//           `EXEC isFileAlredyUploaded @jsonData = N'${JSON.stringify(updatedValues)}'`
//         );
//         const fileExist=(resp[0].existe === 'true');
        
//         if (fileExist) {
//           console.log(`⚠️ El archivo ${file.fileName} ya fue subido.`);
//           return; // 🔹 Si el archivo ya existe, no lo subimos otra vez
//         }
        
//         const fileBuffer = Buffer.from(file.fileData, "base64"); // Convertir Base64 a Buffer
//         const fileContent = fileBuffer.toString("utf-8"); // 🔹 Convertir Buffer a String

//         const updatedValuesFile = {
//             idProject,
//             fileClass: key,
//             userId:String(userId),
//             rowId:'',
//             fileName: file.fileName,
//             fileType: file.fileType,
//             fileData: file.fileType !== "application/vnd.google-earth.kml+xml" ? fileBuffer : null, // 🔹 Solo para otros archivos
//             fileContent: file.fileType === "application/vnd.google-earth.kml+xml" ? fileContent : null, // 🔹 Solo para KML
//           };
        
//           const resultUpload:any = await prisma.$queryRawUnsafe(
//             `EXEC UpdateProjectFile @jsonData = N'${Buffer.from(JSON.stringify(updatedValuesFile), 'utf8').toString()}'`
//           ); 
//       };

//       // 🔹 4️⃣ Función para guardar archivos grandes (`PDF`, `JPG`) en el File System
//       const uploadDir = path.join(process.cwd(), "public/uploads");
//       if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      
//       const saveFileToFS = async (idProject: number,file: any, key:string,rowId: string) => {
//         // console.log('to FS idProject, key',idProject, key,file.fileName,rowId);
//         if (!file) return;
//         // 🔹 Verificar si ya existe antes de subirlo
//         const updatedValues={idProject, userId:String(userId), fileName:file.fileName };
//         const resp:any = await prisma.$queryRawUnsafe(
//           `EXEC isFileAlredyUploaded @jsonData = N'${JSON.stringify(updatedValues)}'`
//         );
//         const fileExist=(resp[0].existe === 'true');
//         //console.log(file.fileName,fileExist,resp[0].existe);
//         if (fileExist) {
//           console.log(`⚠️ El archivo ${file.fileName} ya fue subido.`);
//           return; // 🔹 Si el archivo ya existe, no lo subimos otra vez
//         }
//         // 🔹 Generar un nombre único para el archivo
//         const fileExtension = path.extname(file.fileName); // Obtener la extensión (.pdf, .jpg, etc.)
//         const uniqueFileName = `${uuidv4()}_${userId}${fileExtension}`; // Ej: "a1b2c3d4_15.pdf"
//         const filePath = path.join(uploadDir, uniqueFileName);
//         //const filePath = path.join(uploadDir, file.fileName);

//         const fileBuffer = Buffer.from(file.fileData, "base64");
//         if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
//         fs.writeFileSync(filePath, fileBuffer);
//         const updatedValuesFile = {
//           idProject,
//           fileClass: key,
//           userId:String(userId),
//           fileName: file.fileName,
//           fileType: file.fileType,
//           rowId,
//           filePath,
//         };
//         console.log('en updatedValuesFile',idProject,userId,key, rowId);
//         const resultUpload:any = await prisma.$queryRawUnsafe(
//           `EXEC UpdateProjectFile @jsonData = N'${JSON.stringify(updatedValuesFile)}'`
//         );  
//         console.log(`✅ Archivo ${file.fileName} guardado en ${filePath}`);
//       };
//      // 🔹 5️⃣ Subir archivos pequeños (`Excel`, `KML`) a la BD
//       //await Promise.all([saveFileToFS(idProject, excelFile,'Activities')]);
//       await Promise.all([saveFileToDB(kmlFile,'KML')]);
//       await Promise.all([saveFileToDB(excelFile,'Activities')]);
//       // 🔹 6️⃣ Función para Subir Archivos desde Cada Grilla
//       const uploadFilesFromGrid = async (grid: any[], fileKeys: string[],  rowIdKey: string | string[]) => {
//         console.log('uploadFilesFromGrid',fileKeys, grid.length);
//         //console.log('uploadFilesFromGrid rowIdKey',rowIdKey);
//         for (const row of grid) {
//           // 🔹 Si `rowIdKey` es un array, concatenamos los valores
//           const rowId = Array.isArray(rowIdKey)
//           ? rowIdKey.map((key) => String(row[key])).join("_" ) // 🔹 Generar `rowId` concatenado
//           : String(row[rowIdKey]); // 🔹 Usar `rowId` directamente si es un string
//           await Promise.all(
//             fileKeys.map(async (key: string) => {              
//               const file = row[key];              
//               if (!file || !file.fileType) return null;
//               if (["application/pdf", "image/jpeg"].includes(file.fileType)) {
//                 console.log('pdf/jpg to FS',key,file.fileType);
//                 return saveFileToFS(idProject,file,key,rowId);
//               } else {
//                 console.log('xml to BD', key,file?.fileName);
//                 return saveFileToDB(file,key);
//               }
//             })
//           );
//         }
//       };
//        // 🔹 7️⃣ Subir Archivos de Cada Grilla en Paralelo
//        //console.log('techoGrid',techoGrid);
//        await Promise.all([
//         uploadFilesFromGrid(empalmesGrid, ["rutCliente", "boleta", "poder","f2","diagrama","otrasImagenes"],"nroEmpalme"),
//         uploadFilesFromGrid(instalacionesGrid, ["memoriaCalculo"],"nroInstalacion"),
//         uploadFilesFromGrid(techoGrid, ["imagenTecho"],["nroInstalacion","nroAgua"]),
//       ]);
//       return idProject;
//     },{ timeout: 50000 });//50 segundos para la transacción

//     res.status(200).json({ message: "Proyecto y archivos guardados con éxito", idProject: result });


//   } catch (error) {
//     console.error("❌ Error al guardar en Prisma:", error);
//     res.status(500).json({ error: "Error al guardar proyecto" });
//   }
// }
