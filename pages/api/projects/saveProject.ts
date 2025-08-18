// pages/api/projects/saveProject.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { connectDB } from '@/lib/db';
import { connectGridFS } from '@/lib/gridfs';
import { upsertProject } from '@/lib/projectManager/upsertProject';
import { uploadFiles } from '@/lib/projectManager/uploadFiles';
import { createInitialWorkflowData } from '@/app/services/processEngine/createInitialWorkflow';
import { getDiagramByIdProcess, getCompletedTaskKeys, finishTask, getContextByIdTask } from '@/app/services/processEngine';

export const config = { 
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('🔄 API /api/projects/saveProject invocada');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  await connectDB();
  await connectGridFS();

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Error al parsear el formulario:', err);
      return res.status(500).json({ error: 'Error al procesar archivos' });
    }
    // const session = await mongoose.startSession();
    const session = undefined;
    // session.startTransaction();
    try {
      const values = fields.values ? JSON.parse(fields.values[0]) : {};
      console.log('***en saveProject values',values);
      const state = fields.state?.[0] || '';
      // const userId = values.userId;
      const email = values.email;
      const userModification = values.userModification;
      const userName = values.userName;
      const ubicacionPanel = values.ubicacionPanel;
      const idProcess = 2;
      let idTaskExisting = Number(values.idTask);
      let idProcessInstanceExisting = values.idProcessInstance;
      let idActivity = (state === 'complete') ? 201 : 208;
      let attributes: Record<string, string> = {};
      let currentContext: Record<string, string> = {};
      //  console.log('en saveProject values',values,idActivity);

      let { idProject } = values; 
      const isNew = !idProject || idProject === 0;
 
      if (isNew) {
        const { Counter } = await import('@/models/Counter');
        const counter = await Counter.findByIdAndUpdate(
          { _id: 'project' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true, session }
        );
        idProject = counter.seq;
        values.idProject = idProject;
      }
      // 1️⃣ Actualizar o crear el documento de proyecto
      // console.log('values en saveProject ',values)
      const { activities, ...generalData } = values;
      await upsertProject(values, session);

      // 2️⃣ Subir archivos grandes a GridFS
      await uploadFiles(files, idProject, email, state);

      // 3️⃣ Crear el Process y Task inicial si es nuevo
      if (isNew) {
        attributes = {
          proyectoCompletado: 'pendiente',
          ubicacionPanel: ubicacionPanel ?? '',
          usuarioCreador: userModification ?? ''
        };
        const { idProcessInstance, idTask } = await createInitialWorkflowData({
          idProcess,
          processName: 'Crear proyecto',
          idActivity,
          userSpecific: userModification,//este dato genera el userSpecific del process
          tipoDocumento: 'PROYECTO',
          nroDocumento: idProject,
          attributes,
          infotodo: `Responsable: ${userName}, proyecto N° ${idProject} - Nombre proyecto: ${generalData.projectName}`,
          userModification,
          nameActivity: 'Completar proyecto',
          session
        });
       
        idTaskExisting = idTask;
        idProcessInstanceExisting = idProcessInstance;
        idTaskExisting = idTask;
      
      }else {
        // console.log('idTaskExisting',idTaskExisting)
        const result = await getContextByIdTask(idTaskExisting);
        console.log('🔄 Proyecto existente. No se crea nuevo. result',result);
        if (!result) throw new Error('No se pudo obtener el contexto del proceso para idTask: ${idTaskExisting}');
        idActivity = 208;
        const { idProcess,idProcessInstance, context } = result;
        currentContext = context;//ría de datos antes de actualizar 
        idProcessInstanceExisting = idProcessInstance;
        attributes = context;//río de datos con valors a actualizar
        console.log('🔄 Proyecto existente. No se crea nuevo. idProcessInstanceExisting',idProcessInstanceExisting, attributes);
      }
 
      if (state === 'complete') {
        console.log('🏁 Proyecto completado. Finalizando tarea inicial.');
        // 2. Recuperar info necesaria para finishTask
        const diagram = await getDiagramByIdProcess(idProcess);
        const activityProperties = diagram.activityProperties;
        const context = { ...attributes,proyectoCompletado:'completado' }; //río de datos
        const completedKeys = await getCompletedTaskKeys(idProcessInstanceExisting);
        // const activityProperty = await getActivityPropertiesByIdTask(idTaskExisting);
        const activityProperty = activityProperties.find((activity:any) => activity.idActivity === idActivity);
        const nameActivity = activityProperty?.nameActivity ?? '';

        const currentKey = activityProperty?.key ?? ''; 
        const tipoDocumento = 'PROYECTO';
        const nroDocumento = idProject;

        // console.log('en saveProject idActivity',idActivity,context,tipoDocumento,nroDocumento); 

        const userFinish = userModification;
        const idProcessInstance=idProcessInstanceExisting;
        // console.log('en saveProject antes de finishTask',idProcessInstance); 
        await finishTask(
          diagram.diagram,//que tiene los connectors, shapes y las pages attributes-dibujo 
          diagram.context,//que contiene los atributos del diagrama del proceso (río de datos)            
          activityProperties,//que tiene las propiedades de las actividades y se relaciona con las shapes vía [key]
          context,//que tiene los atributos del process (ría de datos)
          // currentContext,//tiene los atributos del process (río de datos) antes de actualizar
          completedKeys,//que tiene las keys de las actividades/shapes ya completadas
          currentKey,//que tiene la key de la actividad actual
          userFinish,//que tiene el usuario que finalizó la actividad
          idProcessInstance,//que tiene el id del instancia del proceso
          idTaskExisting,//que tiene la task
          tipoDocumento,
          nroDocumento,
          nameActivity,
          idActivity
        );

        //  console.log('finishTaskResult',finishTaskResult);
      }
      // await session.commitTransaction();
      // session.endSession();

      res.status(200).json({ message: 'Proyecto y archivos guardados con éxito', idProject });
    } catch (error) {
      console.error('❌ Error en saveProject:', error);
      // await session.abortTransaction();
      // session.endSession();
      res.status(500).json({ error: 'Error al guardar proyecto' });
    }
  });
};

export default handler;
