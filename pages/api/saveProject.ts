import { NextApiRequest, NextApiResponse } from "next";
//import { v4 as uuidv4 } from "uuid";
import { executeSP, executeSPScalar } from '@/lib/server/spExecutor';
import { uploadFileToFirebase } from '@/lib/server/firebase/uploadFileToFirebase';
import sql from 'mssql';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  
  const { values, excelFile, kmlFile, empalmesGrid, instalacionesGrid, techoGrid, state } = req.body;
  const userId = values.userId;
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

    const saveFileToFirebaseAndRegister = async (idProject: number, file: any, key: string, rowId: string) => {
      if (!file) return;

      const existsResp = await executeSPScalar('isFileAlredyUploaded', [
        { name: 'jsonData', type: sql.NVarChar(sql.MAX), value: JSON.stringify({ idProject, userId: String(userId), fileName: file.fileName }) }
      ]);
      if (existsResp?.existe === 'true') return;

      const { fileName, fileData, fileType } = file;

      const downloadUrl = await uploadFileToFirebase({
        fileName,
        fileData,
        fileType,
        fileClass: key,
        userId: String(userId),
        rowId,
      });
      console.log('🔑 en saveFileToFirebaseAndRegister downloadUrl:', downloadUrl);
      const fileDataToStore = {
        idProject,
        fileClass: key,
        userId: String(userId),
        fileName,
        fileType,
        rowId,
        filePath: downloadUrl,
      };

      await executeSP('UpdateProjectFile', [
        { name: 'jsonData', type: sql.NVarChar(sql.MAX), value: JSON.stringify(fileDataToStore) }
      ]);
    };

    await Promise.all([saveFileToDB(kmlFile, 'KML'), saveFileToDB(excelFile, 'Activities')]);

    const uploadFilesFromGrid = async (grid: any[], fileKeys: string[], rowIdKey: string | string[]) => {
      for (const row of grid) {
        const rowId = Array.isArray(rowIdKey)
        ? rowIdKey.map((key) => String(row[key])).join("_")
        : String(row[rowIdKey]);
        // console.log(`📁 Analizando fila de grilla con rowId: ${rowId}`);
        // console.log(`🔑 fileKeys esperados:`, fileKeys);
        // console.log(`🎯 Valores de row:`, row);
        
        await Promise.all(
          fileKeys.map(async (key: string) => {
            const file = row[key];
            if (!file || !file.fileType) return;
            // console.log(`📂 Analizando archivo para '${key}' con tipo '${file.fileType}'`);

            const isSmallFile = [
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.google-earth.kml+xml"
            ].includes(file.fileType);

            if (isSmallFile) {
              return saveFileToDB(file, key);
            } else {
              return saveFileToFirebaseAndRegister(idProject, file, key, rowId);
            }
          })
        );
      }
    };
    // console.log('🧪 empalmesGrid:', empalmesGrid);
    // console.log('🧪 instalacionesGrid:', instalacionesGrid);
    // console.log('🧪 techoGrid:', techoGrid);
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




/*
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { executeSP, executeSPScalar } from '@/lib/server/spExecutor';
import { uploadFileToFirebase } from '@/lib/server/firebase/uploadFileToFirebase';
import sql from 'mssql';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { values, excelFile, kmlFile, empalmesGrid, instalacionesGrid, techoGrid, state } = req.body;
  const userId = values.userId;
  // console.log('en API saveProject userId, state',userId, state);
  try {
    console.log('en API saveProject values',values);
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

    const saveFileToFirebaseAndRegister = async (idProject: number, file: any, key: string, rowId: string) => {
      console.log('📦 Revisando tipo de archivo:', key, file.fileType);
      if (!file) return;

      const existsResp = await executeSPScalar('isFileAlredyUploaded', [
        { name: 'jsonData', type: sql.NVarChar(sql.MAX), value: JSON.stringify({ idProject, userId: String(userId), fileName: file.fileName }) }
      ]);
      if (existsResp?.existe === 'true') return;

      const { fileName, fileData, fileType } = file;

      const downloadUrl = await uploadFileToFirebase({
        fileName,
        fileData,
        fileType,
        fileClass: key,
        userId: String(userId),
        rowId,
      });

      const fileDataToStore = {
        idProject,
        fileClass: key,
        userId: String(userId),
        fileName,
        fileType,
        rowId,
        filePath: downloadUrl,
      };

      await executeSP('UpdateProjectFile', [
        { name: 'jsonData', type: sql.NVarChar(sql.MAX), value: JSON.stringify(fileDataToStore) }
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
              return saveFileToFirebaseAndRegister(idProject, file, key, rowId);
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
*/


/*
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


*/