import { ActivityEmailFilesType, ActivityType, EmailTemplateType, empalmesGridType, FilesType, FormValues, 
   instalacionesGridType, OptionsSelect, ProjectActivityType, ProjectType, ProveedorType, techoGridType } 
   from '@/types/interfaces';
// import { replacePlaceholders } from './replacePlaceholders';

//para upload de File
export const saveFormData = async (//updateUsuario por ejemplo
    storedProcedure: string,
    parameters: FormValues,
    formatRut: (rut: string) => string,
  ) => {
    // Formatear valores específicos si es necesario
    Object.keys(parameters).forEach((key) => {
      if (typeof parameters[key] === 'string' && key === 'rut') {
        parameters[key] = formatRut(parameters[key]);
      }
    });
  
    try {
      const response = await fetch('/api/saveWithJson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storedProcedure, parameters }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error("Error al consumir la API (0):", error);
        return { success: false, error: error || response.statusText };//response.statusText es 'bad request'
      }
  
      const result = await response.json();
      return { success: true, result };
    } catch (error) {
      console.error("Error al consumir la API (1):", error);
      return { success: false, error: error};
    }
  };
  
  //storedProcedure es un string con la firma del sp: getComunas(@region)
  export const fetchOptions = async (storedProcedure: string, parametersValue?: string | null): Promise<OptionsSelect[]> => {
    //console.log('fetchOptions',storedProcedure);
    let response:any;
    try {
      const [spName, arg] = storedProcedure.split('(');
      //console.log('spName',spName,arg);
      if (parametersValue){
        const parameterNames = arg.replace(')', '').split(',').map((param) => param.trim().replace('@', ''));
        const parameters = parameterNames.reduce((acc, paramName) => {// Crear un objeto con los valores de los parámetros usando sus nombres reales
          acc[`@${paramName}`] = parametersValue;
          return acc;
        }, {} as Record<string, any>);
         response = await fetch('/api/execSP', {
         method: "POST",
         headers: {"Content-Type": "application/json",},
         body: JSON.stringify({ storedProcedure:spName, parameters }),
       });
      } else {
         response = await fetch('/api/execSP', {
          method: "POST",
          headers: {"Content-Type": "application/json",},
          body: JSON.stringify({ storedProcedure:spName }),
        });
 
      } 
       if (!response.ok) {
        console.error('Error al obtener las opciones');
        // throw 'error';
        throw new Error(`Error al obtener opciones: ${response.statusText}`);
      }
      const data = await response.json();
      const formattedOptions = data.map((item: any) => ({
        value: item.id, // Ajusta estos campos según tu resultset
        label: item.label, // Ajusta estos campos según tu resultset
      }));
      const optionsSelect:OptionsSelect[]=formattedOptions;
      return optionsSelect; // Devuelve las opciones formateadas
    } catch (error) {
      console.error("Error al consumir la API:", error);
      throw error;
    }
  }; 



  // export const loadDataProject = async (idTask: number,userId:number,setInitialValues:(x:ProjectType) => void,initialValues: ProjectType)=>{
  //   //console.log('loadDataProject',idTask,userId);
  //   try {
  //     //console.log('lee projectData',`/api/getLoadProject?idTask=${idTask}`);
  //     const response = await fetch(`/api/getProjectFromTask?idTask=${idTask} &userId=${userId}`);
  //     // const res = await fetch(`/api/getToDoListTaskUser?userId=${userId} &idProcessidActivity=${idActivity}`);
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch form data: ${response.statusText}`);
  //     }
  //     const data = await response.json();  //viene {project, files:[{}] }            
  //     //const projectFileData=data;
  //     console.log("✅ Datos cargados desde la API loadDataProject:", data);
  //     // 🔹 Procesar las grillas con archivos asociados
  //     //console.log('data.project',data.project.empalmesGrid,data.project.instalacionesGrid,data.project.techoGrid);
  //     //console.log('data.files',data.files['1'] );
  //     //console.log('data.files',data.files);
  //     // 🔹 Transformar los archivos en `File`
  //     const transformToFile = (fileData: any): File | null => {
  //       if (!fileData) return null;
      
  //       //console.log("📂 Archivo recibido en transformToFile:", fileData);
      
  //       let blob: Blob | null = null; // 📌 Cambiamos `undefined` por `null`
      
  //       //console.log('fileData.fileType',fileData.fileType ,fileData.fileContent, fileData.filePath );
  //       if (fileData.fileContent) {
  //         //console.log('fileData.fileType 2',fileData.fileType,typeof fileData.fileContent)
  //         if (typeof fileData.fileContent !== "string") {
  //           console.error(`❌ fileContent no es un string para: ${fileData.fileName}`);
  //           return null;
  //         }
  //         try {
           
  //           if (fileData.fileType === "application/vnd.google-earth.kml+xml") {
  //             //console.log("🌍 Procesando KML como texto en transformToFile");
  //             blob = new Blob([fileData.fileContent], { type: fileData.fileType });
  //           } else {  
  //             //console.log("📊 Procesando Excel como binario en transformToFile");
  //             const byteCharacters = atob(fileData.fileContent);
  //             const byteNumbers = new Array(byteCharacters.length)
  //             .fill(0)
  //             .map((_, i) => byteCharacters.charCodeAt(i));
  //             const byteArray = new Uint8Array(byteNumbers);
  //             blob = new Blob([byteArray], { type: fileData.fileType });
  //           }
  //         } catch (error) {
  //           console.error("❌ Error al convertir Base64 a Blob:", error);
  //           return null;
  //         }
  //       } else if (fileData.filePath) {
  //         console.log("📂 Creando archivo vacío para el File System:", fileData);
  //         return new File([], fileData.fileName, {
  //           type: fileData.fileType,
  //           lastModified: fileData.lastModified || Date.now(),
  //         });
  //       }
      
  //       if (!blob) {
  //         console.error("❌ No se pudo crear un Blob válido para:", fileData.fileName);
  //         return null;
  //       }
      
  //       const finalFile = new File([blob ?? new Blob()], fileData.fileName, {
  //         type: fileData.fileType,
  //         lastModified: fileData.lastModified || Date.now(),
  //       });
      
  //       //console.log("✅ Archivo transformado a File:", finalFile);
  //       return finalFile;
  //     };
          
  //       // 🔹 Transformar archivos Excel y KML
  //       //console.log("📂 Excel y KML en la API:",data.project.excelFile, data.project.kmlFile); 
  //       const projectFiles = {
  //         kmlFile: transformToFile(data.project.kmlFile),
  //         excelFile: transformToFile(data.project.excelFile),
  //       };
  //       //console.log('projectFiles',projectFiles);


  //       //console.log('instalacionesGrid',data.project.instalacionesGrid);
     
  //     const empalmesGrid= data.project.empalmesGrid.map((row:any) => { 
  //       // console.log("✅ data.files para nroEmpalme:", data.files[String(row.nroEmpalme)]);
  //       // console.log("✅ Buscando archivo rutCliente:", data.files[String(row.nroEmpalme)]?.find((f:any) => f.fileClass.includes("rutCliente")));
  //       return {
  //       ...row,
  //       rutCliente: transformToFile(data.files[String(row.nroEmpalme)]?.find((f:any) => f.fileClass.includes("rutCliente"))),
  //       boleta: transformToFile(data.files[String(row.nroEmpalme)]?.find((f:any) => f.fileClass.includes("boleta"))),
  //       poder: transformToFile(data.files[String(row.nroEmpalme)]?.find((f:any) => f.fileClass.includes("poder"))),
  //       f2: transformToFile(data.files[String(row.nroEmpalme)]?.find((f:any) => f.fileClass.includes("f2"))),
  //       diagrama: transformToFile(data.files[String(row.nroEmpalme)]?.find((f:any) => f.fileClass.includes("diagrama"))),
  //       otrasImagenes: transformToFile(data.files[String(row.nroEmpalme)]?.find((f:any) => f.fileClass.includes("otrasImagenes"))),
  //       }});
  //       //console.log('empalmesGrid',empalmesGrid);
  //       const instalacionesGrid= data.project.instalacionesGrid.map((row:any) => ({
  //         ...row,
  //         memoriaCalculo:  transformToFile(data.files[String(row.nroInstalacion)]?.find((f:any) => f.fileClass.includes("memoriaCalculo"))),
  //       }));
  //       //console.log('instalacionesGrid',instalacionesGrid);
  //       const techoGrid= data.project.techoGrid.map((row:any) => ({
  //         ...row,
  //         imagenTecho:  transformToFile(data.files[String(row.nroInstalacion)+'_'+ String(row.nroAgua)]?.find((f:any) => f.fileClass.includes("imagenTecho"))),
  //       }));
  //       //console.log('instalacionesGrid File',instalacionesGrid);

  //       setInitialValues({
  //        ...data.project,
  //        ...projectFiles,     
  //        empalmesGrid,
  //        instalacionesGrid,
  //        techoGrid,
  //       });
  //     //console.log('processedGrids',processedGrids);
      
  //       // 🔹 Asignar archivos Excel/KML al proyecto
  //     // const projectFiles = {
  //     //     excelFile: data.files.find((f:any) => f.fileName.includes(".xlsx")) || null,
  //     //     kmlFile: data.files.find((f:any) => f.fileName.includes(".kml")) || null,
  //     // };
  //     // console.log('projectFiles',projectFiles);
  //     return ;
  //   } catch (err) {
  //     console.log('error');
  //   } 
  // }

  export const loadDataProject = async (
    idTask: number,
    userId: number,
    setInitialValues: (x: ProjectType) => void,
    initialValues: ProjectType 
  ) => {
    try {
      const response = await fetch(`/api/getProjectFromTask?idTask=${idTask}&userId=${userId}`);
      if (!response.ok) throw new Error(`Failed to fetch form data: ${response.statusText}`);
  
      const data = await response.json();
      const transformToFile = async (fileData: any): Promise<File | null> => {
        // console.log("🔑 Archivo recibido en transformToFile fileData:", fileData);
        if (!fileData) return null;
        try {
          if (fileData.fileContent && fileData.fileContent.length > 0) {
            // console.log("🔑 Archivo recibido en transformToFile fileData.content:", fileData.fileContent.length);
            const blob = new Blob([fileData.fileContent], { type: fileData.fileType });
            return new File([blob], fileData.fileName, {
              type: fileData.fileType,
              lastModified: Date.now(),
            });
          }
          // Si viene desde Firebase: solo creamos un File "vacío"
          if (fileData.filePath && fileData.filePath.length > 0) {
            // console.log("🔑 Archivo recibido en transformToFile fileData.path:", fileData.filePath.length);
            const response = await fetch(fileData.filePath);
            if (!response.ok) throw new Error(`Error leyendo archivo: ${fileData.filePath}`);
            // console.log("🔑 Archivo recibido en transformToFile fileData.path response:", response.ok);
            const blob = await response.blob();
            // console.log("🔑 Archivo recibido en transformToFile fileData.path blob:", blob);
            // console.log("🔑 Archivo recibido en transformToFile fileData.path file:", new File([blob], fileData.fileName, {
            //     type: fileData.fileType,
            //     lastModified: Date.now(),
            //   }));
              return new File([blob], fileData.fileName, {
              type: fileData.fileType,
              lastModified: Date.now(),
            });
          }
          return null;
        } catch (err) {
          console.error(`Error en transformToFile:`, err);
          return null;
        }
      };
  
      const projectFiles = {
        kmlFile: await transformToFile(data.project.kmlFile),
        excelFile: await transformToFile(data.project.excelFile),
      };
      // console.log("🔑 Archivo recibido en transformToFile empalmesGrid-pre:", data.project.empalmesGrid);
      const empalmesGrid = await Promise.all(
        data.project.empalmesGrid.map(async (row: empalmesGridType) => ({
          ...row,
          rutCliente: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("rutCliente"))),
          boleta: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("boleta"))),
          poder: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("poder"))),
          f2: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("f2"))),
          diagrama: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("diagrama"))),
          foto: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("foto"))),
          otrasImagenes: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("otrasImagenes"))),
        }))
      );
      //console.log("🔑 Archivo recibido en transformToFile empalmesGrid-post:", empalmesGrid);
      const instalacionesGrid = await Promise.all(
        data.project.instalacionesGrid.map(async (row: instalacionesGridType) => ({
          ...row,
          memoriaCalculo: await transformToFile(data.files[String(row.nroInstalacion)]?.find((f: any) => f.fileClass.includes("memoriaCalculo"))),
        }))
      );
      console.log("🔑 Archivo recibido en transformToFile instalacionesGrid :", instalacionesGrid );
      const techoGrid = await Promise.all(
        data.project.techoGrid.map(async (row: techoGridType) => ({
          ...row,
          imagenTecho: await transformToFile(data.files[`${row.nroInstalacion}_${row.nroAgua}`]?.find((f: any) => f.fileClass.includes("imagenTecho"))),
        }))
      );
      setInitialValues({
        ...data.project,
        ...projectFiles,
        empalmesGrid,
        instalacionesGrid,
        techoGrid,
      });
    } catch (err) {
      console.error("❌ Error en loadDataProject:", err);
    }
  };
  
  // export const loadDataProject = async (idTask: number, userId: number, setInitialValues: (x: ProjectType) => void, initialValues: ProjectType) => {
  //   try {
  //     const response = await fetch(`/api/getProjectFromTask?idTask=${idTask}&userId=${userId}`);
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch form data: ${response.statusText}`);
  //     }
  
  //     const data = await response.json();
  //     console.log("✅ Datos cargados desde la API loadDataProject:", data);
  //     const transformToFile = async (fileData: any): Promise<File | null> => {
  //       if (!fileData) return null;
      
  //       let blob: Blob | null = null;
  //       try {
  //         if (fileData.fileContent && fileData.fileContent.length > 0) {
  //           console.log("🔑 Archivo recibido en transformToFile fileData.content:", fileData.content);
  //           if (fileData.fileType === "application/vnd.google-earth.kml+xml") {
  //             blob = new Blob([fileData.fileContent], { type: fileData.fileType });
  //           } else {
  //             const byteCharacters = atob(fileData.fileContent);
  //             const byteNumbers = new Array(byteCharacters.length)
  //             .fill(0)
  //             .map((_, i) => byteCharacters.charCodeAt(i));
  //             const byteArray = new Uint8Array(byteNumbers);
  //             blob = new Blob([byteArray], { type: fileData.fileType });
  //           }
  //         } else if (fileData.filePath && fileData.filePath.length > 0) {
  //           console.log("🔑 Archivo recibido en transformToFile fileData.path:", fileData.path);
  //           // const response = await fetch(fileData.filePath);
  //           // if (!response.ok) throw new Error(`Error descargando archivo: ${fileData.filePath}`);
  //           // blob = await response.blob();
  //           try {
  //             const response = await fetch(fileData.filePath);
  //             console.log("🔑 Archivo recibido desde Firebase:", fileData.path);
  //             if (!response.ok) throw new Error(`❌ Error dessscargando archivo desde Firebase: ${fileData.filePath}`);
  //             const blob = await response.blob();
          
  //             return new File([blob], fileData.fileName, {
  //               type: fileData.fileType,
  //               lastModified: fileData.lastModified || Date.now(),
  //             });
  //           } catch (error) {
  //             console.error("❌ Error al recuperar archivo desde Firebase:", error);
  //             return null;
  //           }
  //         }
      
  //         if (!blob) {
  //           console.error("❌ No se pudo crear un Blob válido para:", fileData.fileName);
  //           return null;
  //         }
      
  //         return new File([blob], fileData.fileName, {
  //           type: fileData.fileType,
  //           lastModified: fileData.lastModified || Date.now(),
  //         });
  //       } catch (error) {
  //         console.error(`❌ Error leyendo archivo: ${fileData.filePath}`, error);
  //         return null;
  //       }
  //     };
      
  
  //     const projectFiles = {
  //       kmlFile: await transformToFile(data.project.kmlFile),
  //       excelFile: await transformToFile(data.project.excelFile),
  //     };
  
  //     const empalmesGrid = await Promise.all(data.project.empalmesGrid.map(async (row: any) => ({
  //       ...row,
  //       rutCliente: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("rutCliente"))),
  //       boleta: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("boleta"))),
  //       poder: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("poder"))),
  //       f2: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("f2"))),
  //       diagrama: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("diagrama"))),
  //       otrasImagenes: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("otrasImagenes"))),
  //     })));
  
  //     const instalacionesGrid = await Promise.all(data.project.instalacionesGrid.map(async (row: any) => ({
  //       ...row,
  //       memoriaCalculo: await transformToFile(data.files[String(row.nroInstalacion)]?.find((f: any) => f.fileClass.includes("memoriaCalculo"))),
  //     })));
  
  //     const techoGrid = await Promise.all(data.project.techoGrid.map(async (row: any) => ({
  //       ...row,
  //       imagenTecho: await transformToFile(data.files[`${row.nroInstalacion}_${row.nroAgua}`]?.find((f: any) => f.fileClass.includes("imagenTecho"))),
  //     })));
  
  //     setInitialValues({
  //       ...data.project,
  //       ...projectFiles,
  //       empalmesGrid,
  //       instalacionesGrid,
  //       techoGrid,
  //     });
  //   } catch (err) {
  //     console.error("❌ Error en loadDataProject:", err);
  //   }
  // };
  

//Utilizado en activity/adminActivity/page.tsx, app/definirEjecutor/page.tsx 
  // export const loadDataActivity= async (idTask: number,userId:number,setInitialValues:(x:ActivityType) => void)=>{
  //   //console.log('loadDataActivity',idTask,userId);
  
  //   try {
  //     //console.log('lee projectData',`/api/getLoadProject?idTask=${idTask}`);
  //     const response = await fetch(`/api/getActivityFromTask?idTask=${idTask} &userId=${userId}`);
  //     // const res = await fetch(`/api/getToDoListTaskUser?userId=${userId} &idProcessidActivity=${idActivity}`);
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch form data: ${response.statusText}`);
  //     }
  //     const data = await response.json();  //viene {project, files:[{}] }            
  //     //const projectFileData=data;
  //     //console.log("✅ Datos cargados desde la API:", data);
  //     setInitialValues( {numActividad:data.numActividad,actividad:data.actividad,fechaInicio:data.fechaInicio, fechaTermino:data.fechaTermino, 
  //       duracion:data.duracion,presupuesto:data.presupuesto, responsable:data.responsable, formaEjecucion:data.formaEjecucion,periodoControl:data.periodoControl, 
  //       ejecutor:data.ejecutor, idProjectActivity:data.idProjectActivity,idTask:data.idTask, idTransaction:data.idTransaction, 
  //       idProject:data.idProject, projectName: data.projectName,
  //       ubicacionPanel:data.ubicacionPanel,nroInstalaciones:data.nroInstalaciones,
  //       tipoTerreno:data.tipoTerreno, nivelPiedras:data.nivelPiedra, nivelFreatico:data.nivelFreatico, 
        
  //     })
      
  //     return ;
  //   } catch (err) {
  //     console.log('error');
  //   } 
  
  
  // }


//storedProcedure es un string con la firma del sp: getComunas(@region)
// export const fetchRecordSetFromSP = async (storedProcedure: string, parametersValue?: string | null) => {
  
//   let response:any;
//   try {
//     const [spName, arg] = storedProcedure.split('(');
//     //console.log('spName',spName,arg);
//     if (parametersValue){
//       const parameterNames = arg.replace(')', '').split(',').map((param) => param.trim().replace('@', ''));
//       const parameters = parameterNames.reduce((acc, paramName) => {// Crear un objeto con los valores de los parámetros usando sus nombres reales
//         acc[`@${paramName}`] = parametersValue;
//         return acc;
//       }, {} as Record<string, any>);
//        response = await fetch('/api/execSP', {
//        method: "POST",
//        headers: {"Content-Type": "application/json",},
//        body: JSON.stringify({ storedProcedure:spName, parameters }),
//      });
//     } else {
//        response = await fetch('/api/execSP', {
//         method: "POST",
//         headers: {"Content-Type": "application/json",},
//         body: JSON.stringify({ storedProcedure:spName }),
//       });

//     } 
//      if (!response.ok) {
//       console.error('Error al obtener resultSet');
//       // throw 'error';
//       throw new Error(`Error al obtener opciones: ${response.statusText}`);
//     }
//     const data = await response.json();
//     return data; 
//   } catch (error) {
//     console.error("Error al consumir la API:", error);
//     throw error;
//   }
// };
export const loadDataProjectActivityFromToken= async(token:string, setDataProjectActivity:(x:ProjectActivityType) => void)=>{
  //console.log('en loadDataProjectActivityFromToken', token);
  try{
    const response = await fetch(`/api/leeProjectActivityFromToken?token='${token}'`);
    if (!response.ok) {
      throw new Error(`Failed to fetch form data: ${response.statusText}`);
    }
    const data = await response.json();
    const mensaje = typeof data.mensaje === 'string'? JSON.parse(data.mensaje):data.mensaje;

    setDataProjectActivity( {idProject:data.idProject,idProjectActivity:data.idProjectActivity,idProveedor:data.idProveedor,
      nombreProveedor:data.proveedor,contacto:data.contacto,idActivity:data.idActivity,actividad:data.actividad,mensaje,token:data.token,fechaEnvio:data.fechaEnvio,
      anexos:data.anexos
     })
    return data;  
  }catch(err){
    console.error( err);
  }
}
// export const fetchSPWithParams = async (storedProcedure: string, parametersValue?: string | null) =>{
//     //console.log('fetchSPWithParams',storedProcedure);//,storedProcedure.split('(')
//   // console.log('fetchSPWithParams split',storedProcedure.split('('));
//    let response:any;
//    try {
//     console.log('*****', storedProcedure.split('('));
//      const [spName, arg] = storedProcedure.split('(');
//     // console.log('***spname leeSPWithParams',spName,arg);
//     //  console.log('spname arg',arg);
//      if (parametersValue){
//       const parameterNames = arg.replace(')', '').split(',').map((param) => param.trim().replace('@', ''));
//       const parameters = parameterNames.reduce((acc, paramName) => {// Crear un objeto con los valores de los parámetros usando sus nombres reales
//         acc[`@${paramName}`] = parametersValue;
//         return acc;
//       }, {} as Record<string, any>);
//        //console.log('llamada a execSPWithParams ',JSON.stringify({ storedProcedure:spName, parameters }));       
//        response = await fetch('/api/execSPWithParams', {
//        method: "GET",
//        headers: {"Content-Type": "application/json",},
//        body: JSON.stringify({ storedProcedure:spName, parameters }),
//      });
//     } else {
//        response = await fetch('/api/execSPWithParams', {
//         method: "GET",
//         headers: {"Content-Type": "application/json",},
//         body: JSON.stringify({ storedProcedure:spName }),
//       });
//    }  
//    if (!response.ok) {
//     console.error('Error al obtener resultSet');
//     throw new Error(`Error al obtener datos: ${response.statusText}`);
//   }
//   const data = await response.json();
//   console.log('data',data);
  // const parameters= token;
  // console.log('storedProcedure en leeToken', storedProcedure);
  // try {
  //   const response = await fetch('/api/execSPWithParams', {
  //     method: 'GET',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ storedProcedure, parameters }),
  //   });
    
  //   console.log('token en leeToken', token, response);
  //   if (!response.ok) {
  //     const error = await response.json();
  //     return { success: false, error: error.message || response.statusText };
  //   }

  //   const result = await response.json();
  //   console.log('en leeToken result',result);
  //   return { success: true, result };
//    } catch (error) {
//     console.log('error',error);
//      return { success: false, error: error};
//    }   
// }



/*

      let projectDataJS=JSON.parse(JSON.stringify(projectData));
      const instalacionesGrid=JSON.parse(projectDataJS.instalacionesGrid);
      const techoGrid=JSON.parse(projectDataJS.techoGrid);
      //console.log('en fetch empalmesGrid',projectDataJS.empalmesGrid,isJson(projectDataJS.empalmesGrid));
      const empalmesGrid=JSON.parse(projectDataJS.empalmesGrid);
      //console.log('en fetch activities',projectDataJS.activities,isJson(projectDataJS.activities));
      projectDataJS={...projectDataJS, empalmesGrid, techoGrid, instalacionesGrid};
      let activities=projectDataJS.activities;
      //console.log('activities en JSON',activities.length);
      if (isJson(projectDataJS.activities)){
        //console.log('stringify',JSON.parse(activities).length);
        activities=JSON.parse(activities);
        projectDataJS={...projectDataJS, activities};
      }
      if (!Array.isArray(projectDataJS.activities) && projectDataJS.activities ==="[]" ){
        //console.log('activities NO es array',activities);
        activities=JSON.parse(JSON.stringify([{ "NumActividad": "", Actividad: "",FechaInicio:null, FechaTermino:null, //para corregir error de le BD que devuelve '[]'
          Duracion:0, Presupuesto:null }]));
        //console.log('activities',activities,isJson(JSON.stringify(activities)));
        projectDataJS={...projectDataJS, activities,instalacionesGrid}; //: JSON.stringify(activities) 
      }
      //console.log('pasado el reformateo activities',projectDataJS.activities.length);
     
      //console.log('en fetch projectDataJS',projectDataJS,projectDataJS.activities, typeof projectDataJS.activities );
      return projectDataJS;
      */
  //   } catch (err) {
  //     console.log('error', err);
  //   } 
  // }


  //SIN PROBAR
  export const getObject = async (storedProcedure: string, parametersValue?: string | null) => {
    console.log('getObject',storedProcedure);
    let response:any;
    try {
      const [spName, arg] = storedProcedure.split('(');
      //console.log('spName',spName,arg);
      if (parametersValue){
        const parameterNames = arg.replace(')', '').split(',').map((param) => param.trim().replace('@', ''));
        const parameters = parameterNames.reduce((acc, paramName) => {// Crear un objeto con los valores de los parámetros usando sus nombres reales
          acc[`@${paramName}`] = parametersValue;
          return acc;
        }, {} as Record<string, any>);
         response = await fetch('/api/getJson', {
         method: "POST",
         headers: {"Content-Type": "application/json",},
         body: JSON.stringify({ storedProcedure:spName, parameters }),
       });
      } else {
         response = await fetch('/api/getJson', {
          method: "POST",
          headers: {"Content-Type": "application/json",},
          body: JSON.stringify({ storedProcedure:spName }),
        });
 
      } 
      console.log(response,response);
       if (!response.ok) {
        console.error('Error al obtener las opciones');
        // throw 'error';
        throw new Error(`Error al obtener opciones: ${response.statusText}`);
      }
      const data = await response.json();
      // const formattedOptions = data.map((item: any) => ({
      //   value: item.id, // Ajusta estos campos según tu resultset
      //   label: item.label, // Ajusta estos campos según tu resultset
      // }));
      
      return data; // Devuelve el objeto
     
    } catch (error) {
      console.error("Error al consumir la API:", error);
      throw error;
    }
  };