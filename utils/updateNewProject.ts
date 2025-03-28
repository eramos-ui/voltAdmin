export const updateNewProject = async ( values:any, userModification:any, userId:any, state:string) =>{
  // console.log('en util/updateNewProject values**', userModification, userId, state); 

    try {
      const convertFileToBase64 = async (file: File | null): Promise<{ fileName: string; fileType: string; fileData: string } | null> => {
        // console.log("📥 Archivo recibido en convertFileToBase64:", file, "tipo:", typeof file);
        if (!(file instanceof File)) {
          // console.warn("⚠️ Archivo no es instancia de File o no existe:", file);
          return null;
        }
        // console.log("📦 Archivo recibido en convertFileToBase64:", file);

        try {
          const arrayBuffer = await file.arrayBuffer?.();
          if (!arrayBuffer) {
            console.warn("⚠️ No se pudo obtener arrayBuffer");
            return null;
          }

          const correctedFileType =
            file.type || (file.name?.endsWith(".kml") ? "application/vnd.google-earth.kml+xml" : "application/octet-stream");

          return {
            fileName: file.name || "archivo_sin_nombre",
            fileType: correctedFileType,
            fileData: Buffer.from(arrayBuffer).toString("base64"),
          };
        } catch (error) {
            console.error("❌ Error convirtiendo archivo:", error);
            return null;
        }
      };
      
      // 🔹 Convertir archivos pequeños
      const excelFile =await convertFileToBase64(values.excelFile );
      const kmlFile = await convertFileToBase64(values.kmlFile );
      // 🔹 Convertir archivos de cada grilla
      const convertGridFiles = async (
        grid: any[],
        fileKeys: string[],
        rowIdKey: string | string[]
      ): Promise<any[]> => {
        return await Promise.all(
          grid.map(async (row) => {
            const newRow = { ...row };      
            // Construir rowId usando una o más claves
            const rowId = Array.isArray(rowIdKey)
              ? rowIdKey.map((key) => String(row[key])).join("_")
              : String(row[rowIdKey]);      
            newRow.rowId = rowId;      
            for (const key of fileKeys) {
              const originalFile = row[key];
              // console.log(`🔍 Revisando archivo para key "${key}"`, originalFile);
              newRow[key] = await convertFileToBase64(row[key]);
            }
             return newRow;
          })
        );
      };
      
  
      const empalmesGrid = await convertGridFiles(values.empalmesGrid, ["rutCliente", "boleta", "poder","f2","diagrama","otrasImagenes","fotos"], "nroEmpalme");
      const instalacionesGrid = await convertGridFiles(values.instalacionesGrid, ["memoriaCalculo"], "nroInstalacion");
      const techoGrid = await convertGridFiles(values.techoGrid, ["imagenTecho"], ["nroInstalacion", "nroAgua"]);
      const valuesFull={...values, userModification,userId}
      // console.log('values antes de enviar a la API saveProject',valuesFull);
      // 🔹 Enviar los datos a la API
      const response = await fetch("/api/saveProject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // userId,
          values:valuesFull,
          excelFile,
          kmlFile,
          empalmesGrid,
          instalacionesGrid,
          techoGrid,
          state,
        }),
      });
  
      const result = await response.json();
      console.log("✅ Proyecto guardado:",result);
      if (state ==='complete'){
        console.log('state',state);
      }
    } catch (error) {
      console.error("❌ Error al guardar el proyecto:", error);
    }
  
/*    
    const largeFileKeys = ["boletaConsumo", "rutFotocopia", "poderNotarial"];
    const largeFiles = await Promise.all(
      largeFileKeys
        .map((key) => values[key])
        .filter((file) => file) // Filtrar valores vacíos
        .map((file) => convertFileToBase64(file))
    );

    // const response = await fetch("/api/saveProject", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     projectData: values, // Datos del formulario
    //     kmlFile,
    //     excelFile,
    //     largeFiles,
    //   }),
    // });

    //const result = await response.json();
    console.log("✅ Proyecto guardado:");
  } catch (error) {
    console.error("❌ Error al guardar el proyecto:", error);
  }

return;







  const kmlFile=values.kmlFile;
  const excelFile=values.excelFile;

  //console.log('kmlFile,excelFile',kmlFile,excelFile);
  const kmlBuffer = await kmlFile.arrayBuffer();
  const excelBuffer = await excelFile.arrayBuffer();
  const excelData=Buffer.from(excelBuffer).toString("base64");
  const kmlFileType= kmlFile.type || "application/vnd.google-earth.kml+xml";
  // console.log('detalle kmlFile',kmlFile,kmlFile.name,kmlFileType);
  // console.log('kmlFileData',kmlBuffer,kmlBuffer.length);
  // console.log('detalle excelFile',excelFile,excelFile.name,excelFile.type);
  // console.log('excelBufferData',excelData.length);  
 
  try {
    // 🔹 Convertir archivos a Base64
    const excelBuffer = await excelFile.arrayBuffer();
    const kmlBuffer = await kmlFile.arrayBuffer();

    const response = await fetch("/api/saveProject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        values,
        excelFile: {
          fileName: excelFile.name,
          fileType: excelFile.type,
          fileData: Buffer.from(excelBuffer).toString("base64"),
        },
        kmlFile: {
          fileName: kmlFile.name,
          fileType: kmlFile.type,
          fileData: Buffer.from(kmlBuffer).toString("base64"),
        },
      }),
    });

    const result = await response.json();
    console.log("✅ Proyecto guardado:", result);
  } catch (error) {
    console.error("❌ Error al guardar el proyecto:", error);
  }


return;   
    try {//los archivos a subir son objetos File
        const formData = new FormData();
        // 📌 Iterar sobre `empalmesGrid` y agregar archivos a `FormData`
        values.empalmesGrid.forEach((empalme: any, index: number) => {
          ["rutCliente", "boleta", "poder"].forEach((key) => {
            if (empalme[key] instanceof File) {
              formData.append(`empalme-${index}-${key}`, empalme[key]);
            }
          });
        });  
        formData.append("user_id", String(userId)); 
       
        let uploadedFiles: Record<string, Record<string, string>> = {};
    
        if (formData.has("empalme-0-rutCliente") || formData.has("empalme-0-boleta") || formData.has("empalme-0-poder")) {
          const uploadResponse = await fetch("/api/uploadFile", {
            method: "POST",
            body: formData,
          });
    
          if (!uploadResponse.ok) {
            throw new Error("Error al subir archivos");
          }   
          uploadedFiles = await uploadResponse.json(); // Recibe un objeto con los archivos subidos
          //console.log("📂 uploadedFiles Response:", uploadedFiles); 
        }
        // 📌 Actualizar `empalmesGrid` con los enlaces de los archivos subidos
        const updatedEmpalmesGrid = values.empalmesGrid.map((empalme: any, index: number) => {
            // console.log(`📌 Procesando empalme-${index}:`, empalme);
            // console.log(`📂 uploadedFiles.files:`, uploadedFiles.files);
              // Validar si `uploadedFiles.files` está definido
            const uploadedRutCliente = uploadedFiles.files?.[`empalme-${index}-rutCliente`];
            const uploadedBoleta = uploadedFiles.files?.[`empalme-${index}-boleta`];
            const uploadedPoder = uploadedFiles.files?.[`empalme-${index}-poder`];

            const newEmpalme= {
            ...empalme,
            rutCliente: uploadedRutCliente ?? empalme.rutCliente,
            boleta: uploadedBoleta ?? empalme.boleta,
            poder: uploadedPoder ?? empalme.poder,
            
            }
            //console.log(`✅ Empalme actualizado-${index}:`, newEmpalme);
            return newEmpalme;
        });
        // 📌 Crear el objeto final con los valores actualizados
        const updatedValues = {
            ...values,
            empalmesGrid: updatedEmpalmesGrid,
            user_id:String(userId),
            state,
        };
        //console.log("✅ updatedEmpalmesGrid:", updatedEmpalmesGrid); // 📌 Verificar si se está actualizando correctamente
        // console.log("✅ valores actualizados:", updatedValues);
        //Falta ingresar el fomulario completo
        console.log("Valores del formulario a grabar:", updatedValues,userId);   


        //console.log("📄 Datos listos para guardar-uploadedFiles:", updatedEmpalmesGrid); 
        //if (Object.keys(uploadedFiles).length > 0) { //si no es un objet {}
            //Actualiza tabla Files con punteros a las archivos subidos
            const saveResponse = await fetch("/api/saveWithJson", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    storedProcedure: "UpdateProject",
                    parameters:updatedValues, 
                }),
            });
            if (!saveResponse.ok) {
                throw new Error("Error al guardar el proyecto en la base de datos.");
            }
        //}
    

        console.log("✅ Proyecto guardado correctamente.");
        }  catch (error) {
        console.error("❌ Error en updateNewProject:", error);
    }
*/
}
