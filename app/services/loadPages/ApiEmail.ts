import {  getUsersFullByPerfil } from "@/app/services/users/getUsersFullByPerfil";
import { ActivityEmailFilesType, EmailTemplateType, FilesType, ProveedorType } from "@/types/interfaces";
import { replacePlaceholders } from '../../../utils/replacePlaceholders';


const dominio= process.env.NEXT_PUBLIC_DOMAIN; 
export const sendingEmails= async ( vals:any, userId: string, idTask:number )=>{
    let filteredProveedor = vals.proveedores.filter((obj:any) => vals.proveedoresSelected.includes(obj._id.toString()));
    // console.log('sendingEmails filteredProveedor',filteredProveedor);
    filteredProveedor=filteredProveedor.map((prov:any) =>{//el emial del usuario no se repite, por eso se usa el de adicionalData
      return {...prov, email:prov.aditionalData.email};
    });
    // console.log('sendingEmails filteredProveedor',filteredProveedor);
        
    const urlsConTokensPlaceholder = await generateTokensForProveedores(filteredProveedor,vals.selectedTemplate);
    if (!urlsConTokensPlaceholder || urlsConTokensPlaceholder.length ===0)  return alert("Error no están definidos los meta datos.");
    // console.log('vals.anexosSelected',vals.anexosSelected); 
    const filteredAttachments = vals.jsFiles.filter((obj:any) => vals.anexosSelected.includes(obj.descripcion+'-'+obj._id.toString()));
    // console.log('filteredAttachments',filteredAttachments); 
    const attach=filteredAttachments.map((file:any) =>{ 
      return {filePath:file.filePath,fileType:file.fileType, filename:file.filename}});
    console.log('attach',attach);  
    const emailData = {
        sendTo: urlsConTokensPlaceholder,//inluge body:cuerpoEmail y asunto
        attachments: attach,
    };
    const proveedores=urlsConTokensPlaceholder.map((dt:any)=>{//data para laBD
    return {email:dt.email,contacto:dt.contacto,asunto:dt.asunto,'cuerpoEmail':dt.cuerpoEmail,userId,
      url:dt.url,proveedorId:dt.proveedor._id.toString(),attach,token:dt.token};  
    });
    console.log('proveedores',proveedores);

    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
  
      });
      const result = await response.json();
      if (response.ok) {
        alert("📩 Email enviado correctamente.");
        console.log("✅ Respuesta del servidor:", result);
      } else {
        alert("⚠️ Error al enviar el email.");
        console.error("❌ Error:", result.error);
      }
    } catch (error) {
      alert("⚠️ Error en la conexión con el servidor.");
      console.error("❌ Error:", error);
    }
    // saveProveedorToken(idTask,userId,vals.idTransaction,vals.numActividad,vals.actividad,vals.fechaInicio ,//guarda token en la BD
    //         vals.fechaTermino, vals.presupuesto, proveedores, attach );
  }
  export const saveProveedorToken= async (idTask:number,userId:string,idTransaction:number, numActividad:string,
    actividad:string, fechaInicio: string ,fechaTermino:string, presupuesto:number,
    proveedores:any[],attach:any[] ) =>{
    
    const storedProcedure='UpdateProveedorToken';
    const parameters={idTask, userId,idTransaction, numActividad, actividad, fechaInicio ,fechaTermino, presupuesto,
      proveedores, attach };    
    try {
      const response = await fetch('/api/saveWithJson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storedProcedure, parameters }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || response.statusText };
      }
  
      const result = await response.json();
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error};
    }    

  }
  const generateTokensForProveedores = async (proveedores:ProveedorType[],selectedTemplate:any) => {
    //proveedores: { id: number; email: string, contacto:string, label:string  }[]
    // console.log('generateTokensForProveedores proveedores',proveedores,selectedTemplate);
    if (!proveedores || proveedores.length ===0 ) return;  
    if (!selectedTemplate) return;
    const bodyTemplate=selectedTemplate.bodyTemplate;
    const subjectTemplate=selectedTemplate.subjectTemplate;
    const urls =[];
    for (const proveedor of proveedores) {
     const asunto=replacePlaceholders(subjectTemplate, proveedor.placeholders); 
     let  cuerpoEmail=replacePlaceholders(bodyTemplate, proveedor.placeholders); 
     const proveedorId=proveedor._id.toString();
    //  console.log('proveedor',proveedor,proveedor._id);
     try { // 📌 Generar token en el backend
       const response = await fetch("/api/generateToken", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ proveedorId: proveedorId }),
       });
       const data = await response.json();
       if (!data.token) throw new Error("No se pudo generar el token");
       const token = data.token;
       const urlCotizacion = `http://${dominio}/cotizar?token=${encodeURIComponent(token)}`;
       cuerpoEmail= cuerpoEmail.replace("{CotizacionURL}", urlCotizacion) ;
       urls.push({ proveedorId: proveedorId, email: proveedor.email, contacto:proveedor.contacto, label:proveedor.label,proveedor,
         placeholders: proveedor.placeholders,asunto,cuerpoEmail, url: urlCotizacion ,token });
       // console.log('urls',urls);
     } catch (error) {
       console.error(`Error generando token para proveedor ${proveedorId}:`, error);
     }
    }
   return urls; // 📌 Retorna las URLs generadas con sus respectivos tokens
}; 
// export const loadDataActivityWithFilesAndEmails= async (idTask: number,email:string,setInitialValues:(x:ActivityEmailFilesType) => void)=>{
//     // console.log('loadDataActivity',idTask,email);
//     try {
//       const response = await fetch(`/api/tasks/by-task-user?idTask=${idTask} &email=${email}`);    
//       // const res = await fetch(`/api/getToDoListTaskUser?userId=${userId} &idProcessidActivity=${idActivity}`);
//       if (!response.ok) {
//         throw new Error(`Failed to fetch form data: ${response.statusText}`);
//       }
//       const dataTask = await response.json();  }            
      
//       // console.log(' en loadDataActivity dataTask',dataTask);
//       const responseProcess = await fetch(`/api/process/by-id?idProcessInstance=${dataTask.idProcessInstance}`);//lee el proceso
//       if (!responseProcess.ok) {
//           throw new Error(`Failed to fetch form data: ${responseProcess.statusText}`);
//       }
//       const processData = await responseProcess.json();
//       // console.log('response en processData process',processData);

//       const responseProjectActivity=await fetch(`/api/projectActivity/by-id?idProjectActivity=${processData.nroDocumento}`);//Lee el documento de la actividad
//       if (!responseProjectActivity.ok) {
//           throw new Error(`Failed to fetch form data: ${responseProjectActivity.statusText}`);
//       }
//       const projectActivityData = await responseProjectActivity.json();
//       // console.log('response en projectActivityData projectActivity',projectActivityData);

//       const responseEmailTemplates=await fetch(`/api/emailTemplates/list`);

//       const dataEmailTemplates=await responseEmailTemplates.json();//en bodyTemplate de dataEmailTemplates esta lo que se debe mostrar en el email como metadata 
//       // console.log(' en loadDataActivity dataEmailTemplates',dataEmailTemplates);



//     // const emailTemplatesFull=typeof dataEmailTemplates.bodyTemplate ==='string' ?JSON.parse( dataEmailTemplates.emailTemplate):dataEmailTemplates.emailTemplate;//para llenar el template de email
//       const emailTemplatesFull=dataEmailTemplates;
//       // console.log(' en loadDataActivity emailTemplatesFull',emailTemplatesFull, typeof emailTemplatesFull);
     
//       const responseProject=await fetch(`/api/projects/${projectActivityData.idProject}`);
//       const dataProject=await responseProject.json();
//       // console.log(' en loadDataActivity dataProject',dataProject);

//       let emailTemplate:EmailTemplateType[]=[];
//       if (emailTemplatesFull && emailTemplatesFull.length>0){
//         emailTemplate=emailTemplatesFull.map((email:any) => {
//           const metadataJS=typeof email.metadataJSON ==='string' ? JSON.parse(email.metadataJSON) : email.metadataJSON;
//           return {     
//           idEmailTemplate: email.idEmailTemplate, templateName: email.templateName, subjectTemplate: email.subjectTemplate,
//           bodyTemplate: email.bodyTemplate, metadataJSON:metadataJS } }) 
//       }
//       // console.log(' en loadDataActivity emailTemplate',emailTemplate);
//       const dataProveedores:ProveedorType[]=await getUsersFullByPerfil('Proveedores');
//       // console.log(' en loadDataActivity proveedores',dataProveedores);
//        // const jsFiles:FilesType[] = typeof dataTask.jsFiles === 'string'? JSON.parse(dataTask.jsFiles):dataTask.jsFiles;
//        let metadataJS:any;
//        const fechaInicio=processData.attributes.find((x:any )=> x.idAttribute === 'fechaInicio').value;
//        const fechatermino=processData.attributes.find((x:any )=> x.idAttribute === 'fechaTermino').value;
//        const fechaOriginal = new Date(fechaInicio);
//        const fechaPlazoCotizacion = restarDias(fechaOriginal, 5);

//        metadataJS=emailTemplate[0].bodyTemplate;
//       const proveedores=dataProveedores.map((prov:any) => {
//         const placeholders = buildTemplateObject(metadataJS,{
//           Contacto: prov.aditionalData.contacto, 
//           Actividad: projectActivityData.actividad,
//           NombreProveedor: prov.name,//no se usa en metadataJS
//           EmailProveedor: prov.aditionalData.email,
//           PlazoRespuestaCotizacion:fechaPlazoCotizacion.toISOString(),
//           FechaEntregaTrabajo: fechatermino,
//           Observacion: "",
//           CotizacionURL: "",
//           NombreContratante: `Felipe Ramos
//            Gerente de proyecto
//            EVOLUSOL
//            Generación Eficiente
//            cel: +569 5420 2611
//            felipe.ramos@evolusol.cl`
//         });
//         //  console.log('prov',prov);
//         //  console.log('placeholders',placeholders);
//          return {...prov, placeholders};
//       });

//       const proveedoresJs=proveedores.map((prov:any) => {
//         const placeholders=typeof prov.placeholders === 'string'? JSON.parse(prov.placeholders):prov.placeholders;
//         return {...prov, placeholders};
//       } )
//      //  //console.log("✅ proveedores:", proveedoresJs);
//      //proveedores:, proveedoresJs trae los datos de los proveedores que incluye el contratante (firma del email)

// /*
//   export interface FilesType {//asociada a projectFiles
//     id: number;
//     descripcion: string;
//     fileClass: string;
//     filePath: string;
//     fileType:string;
//     filename:string;
//     nroAgua:number;
//     nroInstalacion:number;
//     subidoPor:string;
//   }
// */
//     setInitialValues( {numActividad:projectActivityData.numActividad,actividad:projectActivityData.actividad,fechaInicio:projectActivityData.fechaInicio, 
//         fechaTermino:projectActivityData.fechaTermino, duracion:projectActivityData.duracion,presupuesto:projectActivityData.presupuesto, 
//         userResponsable:projectActivityData.userResponsable, formaEjecucion:projectActivityData.formaEjecucion,periodoControl:projectActivityData.periodoControl, 
//         userEjecutor:projectActivityData.userEjecutor, idProjectActivity:projectActivityData.idProjectActivity,idTask:dataTask.idTask, idTransaction:dataTask.idTransaction, 
//         idProject:projectActivityData.idProject, projectName: dataProject.projectName,
//         ubicacionPanel:dataProject.ubicacionPanel,nroInstalaciones:dataProject.nroInstalaciones,
//         tipoTerreno:dataProject.tipoTerreno, nivelPiedras:dataProject.nivelPiedra, nivelFreatico:dataProject.nivelFreatico,
//         jsFiles:dataTask.jsFiles, emailTemplate, selectedTemplate:null, proveedores:proveedoresJs,anexosSelected:[],proveedoresSelected:[], selectedTemplateId:0,
//         idProcessInstance:dataTask.idProcessInstance, idActivity:dataTask.idActivity     
//        })      
//       return ;
//     } catch (err) {
//       console.log('error',err);
//     } 
//   }
//   const extractPlaceholders= (template: string): string[] => {
//     const regex = /{(.*?)}/g;
//     const matches = template.match(regex) || [];
//     return matches.map(m => m.replace(/[{}]/g, ''));
//   }
  
//   const buildTemplateObject= (template: string, values: Record<string, string>): Record<string, string> => {
//     const keys = extractPlaceholders(template);
//     const result: Record<string, string> = {};
  
//     keys.forEach(key => {
//       result[key] = values[key] ?? '';
//     });
  
//     return result;
//   }
//   const restarDias= (fecha: Date, dias: number): Date => {
//     const nuevaFecha = new Date(fecha);
//     nuevaFecha.setDate(nuevaFecha.getDate() - dias);
//     return nuevaFecha;
//   }