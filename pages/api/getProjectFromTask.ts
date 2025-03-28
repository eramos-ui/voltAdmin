
import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/server/spExecutor';
// import { ProjectType } from '@/types/interfaces';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });

  const { idTask, userId } = req.query;
  if (!idTask) return res.status(400).json({ error: 'idTask is required' });

  try {
    const query = `EXEC getProjectFromTask @idTask= ${Number(idTask)}, @userId = ${Number(userId)}`;
    const result = await executeQuery(query);
    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }
    
    const projectData = JSON.parse(JSON.stringify(result));
    const idProject = projectData[0].idProject;
    const project = projectData[0];
    
    const queryFiles = `EXEC filesFromProject @idProject= ${Number(idProject)}`;
    const resultFiles = await executeQuery(queryFiles);
    const projectFiles = JSON.parse(JSON.stringify(resultFiles));
    
    const excelFile = projectFiles.find((file: any) => file.fileName.endsWith(".xlsx"));
    const kmlFile = projectFiles.find((file: any) => file.fileName.endsWith(".kml"));
    
    const processedProject = {
      ...project,
      excelFile: {
        fileClass: excelFile?.fileClass || 'Activities',
        fileName: excelFile?.fileName || null,
        fileType: excelFile?.fileType || null,
        row: 'global',
        fileContent: excelFile ? Buffer.from(excelFile.fileData.data).toString("base64") : null,
      },
      kmlFile: {
        fileClass: kmlFile?.fileClass || 'KML',
        fileName: kmlFile?.fileName || null,
        fileType: kmlFile?.fileType || null,
        row: 'global',
        fileContent: kmlFile?.fileContent || null,
      },
      activities: project.activities ? JSON.parse(project.activities) : [],
      empalmesGrid: project.empalmesGrid ? JSON.parse(project.empalmesGrid) : [],
      instalacionesGrid: project.instalacionesGrid ? JSON.parse(project.instalacionesGrid) : [],
      techoGrid: project.techoGrid ? JSON.parse(project.techoGrid) : [],
    };
    // console.log("🔑 En getProjectFromTask projectFiles:", projectFiles.length);
    
    const processedFiles = await Promise.all(
      projectFiles.map(async (file: any) => {
        if (!file) return null;
        const lastModified = file.lastModified || Date.now();
        let fileContentBase64 = null;

        if (file.fileData) {
          try {
            if (Buffer.isBuffer(file.fileData)) {
              fileContentBase64 = file.fileData.toString("base64");
            } else if (typeof file.fileData === "object" && file.fileData.type === "Buffer" && Array.isArray(file.fileData.data)) {
              fileContentBase64 = Buffer.from(file.fileData.data).toString("base64");
            }
          } catch (error) {
            console.error(`❌ Error al convertir a Base64: ${file.fileName}`, error);
          }

          const fileSize = file.fileData?.data
            ? Buffer.byteLength(Buffer.from(file.fileData.data))
            : 0;

          return {
            fileClass: file.fileClass,
            fileName: file.fileName,
            fileType: file.fileType,
            fileSize,
            lastModified,
            row: file.fileClass.includes('Activities') ? 'global' : file.row,
            fileContent: fileContentBase64,
          };
        } else if (file.filePath) {
          try {
            const response = await fetch(file.filePath);
            if (!response.ok) throw new Error(`Error leyendo archivo: ${file.filePath}`);
            
            const blobBuffer = await response.arrayBuffer();
            const fileBuffer = Buffer.from(blobBuffer);
            const fileSize = fileBuffer.length;
        
            return {
              fileClass: file.fileClass,
              fileName: file.fileName,
              fileType: file.fileType,
              filePath: file.filePath,
              fileSize,
              lastModified,
              row: file.row,
              fileContent: fileBuffer.toString("base64"),
            };
          } catch (error) {
            console.error(`❌ Error leyendo archivo desde URL Firebase: ${file.filePath}`, error);
          }
        } else if (file.fileContent) {
          const fileSize = file.fileContent.length;
          return {
            fileClass: file.fileClass,
            fileName: file.fileName,
            fileType: file.fileType,
            fileSize,
            lastModified,
            row: file.fileClass.includes('KML') ? 'global' : file.row,
            fileContent: file.fileContent,
          };
        }
        return null;
      }).filter(Boolean)
    );
    // console.log("🔑 En getProjectFromTask processedFiles:", processedFiles.length);
    const filesByRow = processedFiles.reduce((acc: any, file: any) => {
      if (!file.row) return acc;
      if (!acc[file.row]) acc[file.row] = [];
      acc[file.row].push({
        fileClass: file.fileClass,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        lastModified: file.lastModified,
        filePath: file.filePath || null,
        fileContent: file.fileContent || null,
      });
      return acc;
    }, {});

    res.status(200).json({
      project: processedProject,
      files: filesByRow,
    });
  } catch (error) {
    console.error("❌ Error al obtener datos del proyecto:", error);
    res.status(500).json({ error: 'Error fetching task data' });
  }
}




// import { NextApiRequest, NextApiResponse } from 'next';
// import { Prisma Client } from '@prisma/client';
// import { ProjectType } from '@/types/interfaces';
// import fs from "fs";


// const prisma = new Prisma Client();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });
//   const { idTask ,userId} = req.query;
//   console.log('idTask, userId',idTask, userId );
//   if (!idTask) {
//     return res.status(400).json({ error: 'idTask is required' });
//   }
//   try {
//      // 🔹 Obtener los datos generales del proyecto
//     //console.log('queryRaw loadProject',`EXEC getProjectFromTask @idTask=${Number(idTask)}`)//En postman POST o GET: http://localhost:3000/api/getLoadProject?idTask=9
//     const query=`EXEC getProjectFromTask @idTask= ${Number(idTask)}, @userId = ${Number(userId)} `;
//     const result = await prisma.$queryRawUnsafe<ProjectType>(query);
//     console.log('query en getProjectoFromTask',query);
//     if (!result) {
//       return res.status(404).json({ error: "Proyecto no encontrado" });
//     }
//     //Caso de resultset
//     const projectData = JSON.parse(JSON.stringify(result));
//     //console.log('result en getProjectoFromTask',projectData[0].idProject,typeof projectData[0]);
//     const idProject=projectData[0].idProject;
//     //console.log('idProject',idProject);
//     let project=projectData[0];
//     // 🔹 Convertir `empalmesGrid` de string a objeto si existe
    
//     // 🔹 Obtener los archivos del proyecto
//     const queryFiles=`EXEC filesFromProject @idProject= ${Number(idProject)}`;
//     const resultFiles = await prisma.$queryRawUnsafe(queryFiles);
//     const projectFiles = JSON.parse(JSON.stringify(resultFiles));
//     // 🔹 Extraer archivos Excel y KML de `projectFiles`
//     const excelFile = projectFiles.find((file:any) => file.fileName.endsWith(".xlsx"));
//     const kmlFile = projectFiles.find((file:any) => file.fileName.endsWith(".kml"));
//     console.log('excelFile,kmlFile',(excelFile), (kmlFile) );

//     let processedProject = {
//       ...project,
//       excelFile: {
//         fileClass:(excelFile)? excelFile.fileClass:'Activities',
//         fileName: (excelFile)? excelFile.fileName:null,
//         fileType: (excelFile)?excelFile.fileType:null,
//         row: 'global',
//         fileContent:(excelFile)? Buffer.from(excelFile.fileData.data).toString("base64"):null,
//       },
//       kmlFile:{ 
//         fileClass: (kmlFile)? kmlFile.fileClass:'KML',
//         fileName: (kmlFile)?kmlFile.fileName:null,
//         fileType: (kmlFile)? kmlFile.fileType:null,
//         row: 'global',
//         fileContent: (kmlFile)?kmlFile.fileContent:null, 
//       },
//       activities: project.activities ? JSON.parse(project.activities) : [],      
//       empalmesGrid: project.empalmesGrid ? JSON.parse(project.empalmesGrid) : [], // 🔹 Convierte JSON string a objeto
//       instalacionesGrid: project.instalacionesGrid ? JSON.parse(project.instalacionesGrid) : [],
//       techoGrid: project.techoGrid ? JSON.parse(project.techoGrid) : [],
//     };   
//     //console.log('projectFiles',projectFiles.length);
//     // 🔹 Procesar archivos
//     const processedFiles = await Promise.all(
//       projectFiles.map(async (file:any) => {
//         if (!file) return null;
//         // 🔹 Inventamos los valores `lastModified` y `size` si no existen en la BD
//         const lastModified = file.lastModified || Date.now();
//         // const fileSize = file.fileData ? Buffer.byteLength(file.fileData) : 0;
//         let fileContentBase64 = null;
//         //console.log('file', file.fileClass,file.fileName,file.fileType, file.filePath,file.row, lastModified,fileSize);//,file.fileData.length,file.fileContent.length
//         if (file.fileData) {//Excel
//           console.log(`📂 Tipo de fileData para ${file.fileName}:`, typeof file.fileData);
//           try {
//             if (Buffer.isBuffer(file.fileData)) {
//               // 📌 Caso 1: fileData es un Buffer válido
//               fileContentBase64 = file.fileData.toString("base64");
//             } else if (typeof file.fileData === "object" && file.fileData.type === "Buffer" && Array.isArray(file.fileData.data)) {
//               // 📌 Caso 2: fileData es un objeto JSON con { type: 'Buffer', data: [...] }
//               console.warn(`⚠️ Convirtiendo JSON Buffer a Buffer real para: ${file.fileName}`);
//               fileContentBase64 = Buffer.from(file.fileData.data).toString("base64");
//             } else {
//               console.error(`❌ fileData no es un Buffer válido para: ${file.fileName}`, file.fileData);
//             }
//           } catch (error) {
//             console.error(`❌ Error al convertir a Base64: ${file.fileName}`, error);
//           }


//           //console.log('file.fileData',fileContentBase64.length);
//           const fileSize = file.fileData && typeof file.fileData === "object" && file.fileData.data
//           ? Buffer.byteLength(Buffer.from(file.fileData.data))
//           : 0;
//           //console.log("✅ Tipo de fileData:", typeof file.fileData,file.fileName,fileSize, file.fileClass, file.fileType,file.row);
//           return {
//             fileClass: file.fileClass,
//             fileName: file.fileName,
//             fileType: file.fileType,  
//             fileSize,
//             lastModified,          
//             row: (file.fileClass.includes('Activities'))?'global': file.row,
//             fileContent: fileContentBase64,// Buffer.from(file.fileData.toString("base64")), // Convertir binario a Base64
//           };
//         } else if (file.filePath) {//pdf o jpg
//           //console.log('file.filePath',file.fileName,file.row);
//           let fileSize=0;
//           let fileBuffer=null;
//           try {//el archivo pudo ser borrado
//             fileBuffer = fs.readFileSync(file.filePath);
//             fileSize = file.filePath ? fs.statSync(file.filePath).size : 0;
//           }catch (error) {
//             console.error(`❌ Error obteniendo tamaño de archivo en ${file.filePath}:`, error);
//           }
//           return {
//             fileClass: file.fileClass,
//             fileName: file.fileName,
//             fileType: file.fileType,
//             filePath:file.filePath,
//             fileSize,
//             lastModified,
//             row: file.row,
//             fileContent: (fileBuffer) ? fileBuffer.toString("base64"): null, // Convertir a Base64
//           };          
//         }else if (file.fileContent) {// los xml
//           //console.log('file.fileContent',file.fileClass, file.row);
//           const fileSize=file.fileContent.length;
//           return {
//             fileClass: file.fileClass,
//             fileName: file.fileName,
//             fileType: file.fileType,
//             fileSize,
//             lastModified,
//             row: (file.fileClass.includes('KML'))?'global': file.row,
//             fileContent: file.fileContent, // Convertir a Base64
//           };
//         }
//         return null;
//       }).filter(Boolean)
//     );

//     //
//     //console.log('processedFiles',processedFiles.length);
//     // processedFiles.forEach( (file: any)=>{
//     //   if (file)  console.log('file',file.fileType,file.fileName); 
//     // })
//     //console.log('processedFiles',processedFiles);
//     const filesByRow = processedFiles.reduce((acc:any, file:any) => {//
//        //console.log('file.row',file.row, file.fileClass,file.fileName, file.fileType,file.filePath);
//       if (!file.row) return acc;
//       if (!acc[file.row]) acc[file.row] = [];
//       acc[file.row].push({
//         fileClass:file.fileClass,
//         fileName: file.fileName,
//         fileType: file.fileType,
//         fileSize: file.fileSize,
//         lastModified:file.lastModified,
//         filePath: file.filePath || null,
//         fileContent: file.fileContent || null,
//       });
//       return acc;
//     }, {});

//     //console.log('filesByRow',filesByRow);

//     //console.log("📂 Respuesta final de la API:", JSON.stringify(filesByRow["global"], null, 2));
//     res.status(200).json({
//       project:processedProject,
//       //files: processedFiles.filter(Boolean), //elimina los null
//       files:filesByRow,
//     });
//   } catch (error) {
//     console.error("❌ Error al obtener datos del proyecto:", error);
//     res.status(500).json({ error: 'Error fetching task data' });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
