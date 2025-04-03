import { ActivityEmailFilesType, EmailTemplateType, FilesType, ProveedorType } from "@/types/interfaces";
import { replacePlaceholders } from "./replacePlaceholders";


const dominio= process.env.NEXT_PUBLIC_DOMAIN; 
export const sendingEmails= async ( vals:any, userId: number,idTask:number )=>{
    const filteredProveedor = vals.proveedores.filter((obj:any) => vals.proveedoresSelected.includes(obj.id));
        
    const urlsConTokensPlaceholder = await generateTokensForProveedores(filteredProveedor,vals.selectedTemplate);
    if (!urlsConTokensPlaceholder || urlsConTokensPlaceholder.length ===0)  return alert("Error no están definidos los meta datos.");
    
    const filteredAttachments = vals.jsFiles.filter((obj:any) => vals.anexosSelected.includes(obj.id));
    const attach=filteredAttachments.map((file:any) =>{ 
      return {filePath:file.filePath,fileType:file.fileType, filename:file.filename}});
    //console.log('urlsConTokensPlaceholder',urlsConTokensPlaceholder);  setSendingEmail(false);return
    const emailData = {
        sendTo: urlsConTokensPlaceholder,//inluge body:cuerpoEmail y asunto
        attachments: attach,
    };
    const proveedores=urlsConTokensPlaceholder.map((dt:any)=>{//data para laBD
    return {email:dt.email,contacto:dt.contacto,asunto:dt.asunto,'cuerpoEmail':dt.cuerpoEmail,userId,
      url:dt.url,proveedorId:dt.proveedor.id,attach,token:dt.token};  
    });
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
    saveProveedorToken(idTask,userId,vals.idTransaction,vals.numActividad,vals.actividad,vals.fechaInicio ,//guarda token en la BD
            vals.fechaTermino, vals.presupuesto, proveedores, attach );
  }
  export const saveProveedorToken= async (idTask:number,userId:number,idTransaction:number, numActividad:string,
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
    if (!proveedores || proveedores.length ===0 ) return;  
    if (!selectedTemplate) return;
    const bodyTemplate=selectedTemplate.bodyTemplate;
    const subjectTemplate=selectedTemplate.subjectTemplate;
    const urls =[];
    for (const proveedor of proveedores) {
     const asunto=replacePlaceholders(subjectTemplate, proveedor.placeholders); 
     let  cuerpoEmail=replacePlaceholders(bodyTemplate, proveedor.placeholders); 
     try { // 📌 Generar token en el backend
       const response = await fetch("/api/generateToken", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ proveedorId: proveedor.id }),
       });
       const data = await response.json();
       if (!data.token) throw new Error("No se pudo generar el token");
       const token = data.token;
       const urlCotizacion = `http://${dominio}/cotizar?token=${encodeURIComponent(token)}`;
       cuerpoEmail= cuerpoEmail.replace("{CotizacionURL}", urlCotizacion) ;
       urls.push({ proveedorId: proveedor.id, email: proveedor.email, contacto:proveedor.contacto, label:proveedor.label,proveedor,
         placeholders: proveedor.placeholders,asunto,cuerpoEmail, url: urlCotizacion ,token });
       // console.log('urls',urls);
     } catch (error) {
       console.error(`Error generando token para proveedor ${proveedor.id}:`, error);
     }
    }
   return urls; // 📌 Retorna las URLs generadas con sus respectivos tokens
}; 
export const loadDataActivityWithFilesAndEmails= async (idTask: number,userId:number,setInitialValues:(x:ActivityEmailFilesType) => void)=>{
    // console.log('loadDataActivity',idTask,userId);
    try {
      //console.log('lee projectData',`/api/getLoadProject?idTask=${idTask}`);
      const response = await fetch(`/api/getActivityFromTask?idTask=${idTask} &userId=${userId}`);
      // const res = await fetch(`/api/getToDoListTaskUser?userId=${userId} &idProcessidActivity=${idActivity}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch form data: ${response.statusText}`);
      }
      const data = await response.json();  //viene {project, files:[{}] }            
      //const projectFileData=data;
      //console.log("✅ Datos cargados desde la API:", data);
       const emailTemplatesFull=typeof data.emailTemplate ==='string' ?JSON.parse( data.emailTemplate):data.emailTemplate;
       let emailTemplate:EmailTemplateType[]=[{idEmailTemplate:0,templateName:'',subjectTemplate:'',bodyTemplate:'',metadataJSON:''}]; 
       if (emailTemplatesFull && emailTemplatesFull.length>0){
         emailTemplate=emailTemplatesFull.map((email:any) => {
           const metadataJS=typeof email.metadataJSON ==='string' ? JSON.parse(email.metadataJSON) : email.metadataJSON;
           return {     
           idEmailTemplate: email.idEmailTemplate, templateName: email.templateName, subjectTemplate: email.subjectTemplate,
           bodyTemplate: email.bodyTemplate, metadataJSON:metadataJS } }) 
       }
       const jsFiles:FilesType[] = typeof data.jsFiles === 'string'? JSON.parse(data.jsFiles):data.jsFiles;
       const proveedores:ProveedorType[] = typeof data.proveedores === 'string'? JSON.parse(data.proveedores):data.proveedores;
       const proveedoresJs=proveedores.map((prov:any) => {
         const placeholders=typeof prov.placeholders === 'string'? JSON.parse(prov.placeholders):prov.placeholders;
         return {...prov, placeholders};
       } )
       //console.log("✅ proveedores:", proveedoresJs);
       //proveedores:, proveedoresJs trae los datos de los proveedores que incluye el contratante (firma del email)
       setInitialValues( {numActividad:data.numActividad,actividad:data.actividad,fechaInicio:data.fechaInicio, fechaTermino:data.fechaTermino, 
        duracion:data.duracion,presupuesto:data.presupuesto, responsable:data.responsable, formaEjecucion:data.formaEjecucion,periodoControl:data.periodoControl, 
        ejecutor:data.ejecutor, idProjectActivity:data.idProjectActivity,idTask:data.idTask, idTransaction:data.idTransaction, 
        idProject:data.idProject, projectName: data.projectName,
        ubicacionPanel:data.ubicacionPanel,nroInstalaciones:data.nroInstalaciones,
        tipoTerreno:data.tipoTerreno, nivelPiedras:data.nivelPiedra, nivelFreatico:data.nivelFreatico,
        jsFiles, emailTemplate, selectedTemplate:null, proveedores:proveedoresJs,anexosSelected:[],proveedoresSelected:[], selectedTemplateId:0,      
       })      
      return ;
    } catch (err) {
      console.log('error',err);
    } 
  }
  