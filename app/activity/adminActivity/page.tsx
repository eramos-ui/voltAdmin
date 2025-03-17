"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'; 
import { useRouter, useSearchParams  } from 'next/navigation';
import * as Yup from "yup";
 import { loadDataActivity } from '@/utils/apiHelpers';

import { ActivityType, OptionsSelect } from '@/types/interfaces';
import { Field, Form, Formik } from 'formik';
import { CustomButton, CustomDate, CustomInput, CustomLabel, CustomSelect } from '@/components/controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEraser, faFloppyDisk, faHome } from '@fortawesome/free-solid-svg-icons';
import { formEjecucionActividadOptions } from '@/data/selectType';
import { LoadingIndicator } from '@/components/general/LoadingIndicator';
import { updateActivity } from '@/utils/updateActivity';
import { loadResponsables } from '@/utils/loadResponsables';
const validationSchema = Yup.object({
    formaEjecucion: Yup.string().required("La forma de ejecución de la actividad es obligatoria"),
    responsable: Yup.string().required("Seleccione el responsable de la actividad"),

  });
const AdminActivityPage = () => {
    const router                                                  = useRouter();
    const searchParams                                            = useSearchParams();
    const { data: session, status }                               = useSession();
    const [ userEmail, setUserEmail ]                             = useState<string>('');
    const [ loading, setLoading ]                                 = useState(true);
    const [ responsablesOptions, setResponsablesOptions ]         = useState<OptionsSelect[]>();
    const menuId                                                  = Number(searchParams?.get("menuId"));
    const idTask                                                  = Number(searchParams?.get("idTask"));
    const [ initialValues, setInitialValues ]                     = useState <ActivityType>({ 
        numActividad:'', actividad:'', fechaInicio: '' ,fechaTermino:'', duracion: 0 ,presupuesto:0,idTask:0, idTransaction:0,
        idProjectActivity:0, idProject: 0, projectName: '', responsable:'', formaEjecucion:'', periodoControl:'', ejecutor:'',
        ubicacionPanel:'',  nroInstalaciones:1,
        tipoTerreno:"", nivelPiedras:"", nivelFreatico:0, 
     } 
    );
    useEffect(()=>{
        const cargaResponsables=async () => setResponsablesOptions( await loadResponsables());
        cargaResponsables();     
    },[])
    useEffect(() => {
        const fetchData= async (idTask:number) => {
          // console.log('fetchData idTask',idTask);
        try{
          if (session?.user.id)  {
            // console.log('useEffect session',session);
            await loadDataActivity(idTask,session.user.id,setInitialValues);
          }
        }catch (err){
          console.log('error', err);
        }
        //responsablesOptions
      }  
      setLoading(true);
      if (idTask && idTask>0){//revisa si al abrir existe idTask. Esto indica completar proyecto
        fetchData(idTask);  
      }     
     }, [idTask]); 
     useEffect(() =>{
        if (session)  setUserEmail(session?.user.email);
     },[session]) 
     useEffect(() => { 
        if (initialValues.idProject && initialValues.idProject>0 ){
            setLoading(false);
            // console.log('use Effect initialValues',initialValues);
        }

     },[initialValues.idProject]);
     const handleExit = () => {
        // const confirmed = window.confirm(
        // "¿Está seguro de que desea abandonar el proyecto? (perderá lo que haya hecho)"
        // );
        //if (confirmed) { 
            router.back()   
        //}
      };  
     if ( loading ){  
        return <LoadingIndicator  message='cargando'  />;        
     }
  return(
    <>
    {/* { console.log('JSX AdminActivity initialValues',loading,initialValues.fechaInicio, initialValues.fechaTermino) } */}
     { !loading &&
     <div className="p-4">
       <p className="text-3xl font-bold text-center" > Define responsable y forma de ejecución de la actividad {initialValues.numActividad}</p>
       <p  className="text-2xl font-bold text-center"> `Proceso: (N°${initialValues.idProject}) "${initialValues.projectName}"`</p>
       <Formik
         initialValues={initialValues}
         validationSchema={validationSchema}
         enableReinitialize
         onSubmit={(values) => {  updateActivity(values,userEmail); router.back(); }}         //updateNewProject(values,Number(session?.user.id),'completed'); router.push('/');
       >
         {({ values, errors, touched, setFieldValue, resetForm }) => { 
        //   useEffect(()=>{
        //       if ( selectedRow ){
        //           const currentActivity = selectedRow["NumActividad"].toString();
        //           const existingIds = new Set(values.activities?.map((row) => String(row["NumActividad"]))); 
        //           setNextActivityToAdd( getNextActivityId(currentActivity,existingIds));
        //       }
        //     },[selectedRow])
        //   const handleEdit = (row: any) => {  setEditingRow(row); setIsEditing(true); setSelectedRow(row) }; 
        //   const handleAdd = () => {
        //     if (!selectedRow) {
        //       alert('Debe seleccionar la actividad previa a la que desea agregar.');
        //       return;
        //     }
        //     const currentActivity = selectedRow["NumActividad"].toString();
        //     const existingIds = new Set(values.activities?.map((row) => String(row["NumActividad"]))); // Obtener todos los IDs existentes en la grilla
        //     const newActivity = getNextActivityId(currentActivity,existingIds);
        //     console.log('en handleAdd',newActivity);
        //     setNextActivity(newActivity);
        //     setIsAdding(true);
        //  };
        //   const handleDelete = (row: any) => { //console.log('row en handleDelete',row);
        //     setEditingRow(row);
        //     const actividadId = row["NumActividad"];
        //     const hasChildren = values.activities.some(item =>
        //       item["NumActividad"].toString().startsWith(`${actividadId}.`)
        //     );
        //     if (hasChildren) {
        //       alert(`No puedes eliminar la actividad "${actividadId} ${row.Actividad}" porque tiene actividades dependientes.`);
        //       return;
        //     }
        //     if (window.confirm(`¿Eliminar la actividad "${actividadId} ${row.Actividad}"?`)) {
        //       const newRows = values.activities.filter((item) => item["NumActividad"] !== actividadId);
        //       setFieldValue("activities", newRows); // Actualizar el array en Formik
        //     }
        //   };
        //   const handleSave = (updatedRow: GridRowType) => {//    console.log('en handleSave',updatedRow);
        //     if (isAdding) {
        //       const newRows = values.activities ? sortGridByActivityId([...values.activities, updatedRow]) : [updatedRow];
        //       setFieldValue('activities',newRows);
        //     } else if (isEditing) {
        //       const updatedRows = values.activities?.map(row =>
        //         row["NumActividad"] === editingRow?.["NumActividad"] ? updatedRow : row
        //       );
        //       setFieldValue('activities',updatedRows);
        //     }
        //     setIsAdding(false);
        //     setIsEditing(false);
        //     setEditingRow(null);
        //  };
         return ( 
          <Form>
            <div className="mb-1 flex items-start space-x-2">
                <div className="w-3/5">
                    <Field name="actividad" type="text" as={CustomInput} label="Descripción de la actividad" placeholder="Ingresa la descripción de la actividad"
                    error={touched.actividad && errors.actividad ? errors.actividad : undefined} required theme="light" width="100%" 
                    onChange={(e:any) => setFieldValue("actividad", e.target.value)}
                    />
                </div>
            </div>   
           <div className="mb-1 flex items-start space-x-2">
             <div className="w-1/5">
                <Field name="fechaInicio" as={CustomDate}  label="Fecha de inicio" placeholder="Ingresa la fecha de inicio"
                //error={touched.fechaInicio && errors.fechaInicio ? errors.fechaInicio : undefined} 
                required theme="light" width="100%" format="dd-MM-yyyy" //onChange={(e:any) => setFieldValue("fechaInicio", e.target.value)}
                />
            </div>
            <div className="w-1/5">
                <Field name="fechaTermino" as={CustomDate} label="Fecha de término" placeholder="Ingresa la fecha de término"
                //error={touched.fechaTermino && errors.fechaTermino ? errors.fechaTermino : undefined} 
                required theme="light" width="100%" format="dd-MM-yyyyy" onChange={(e:any) => setFieldValue("fechaInicio", e.target.value)}
                />
            </div>
            <div className="w-1/5" >
                <CustomLabel label={`(Duración en días: ${values.duracion}) `} size='normal+' 
                //style={{paddingTop:'15px',marginTop:'30px' }}
                />
            </div>
           </div>
           <div className="mb-1 flex items-start space-x-2">
               <div className="w-1/5" >
                <Field name="presupuesto" type="number" as={CustomInput} label="Presupuesto" placeholder="Ingresa presupuesto de la actividad"
                    error={touched.presupuesto && errors.presupuesto ? errors.presupuesto : undefined} theme="light" width="70%" 
                    onChange={(e:any) => setFieldValue("presupuesto", e.target.value)} textAlign='right' style={{marginTop:'2px'}}
                />
               </div> 
               <div className="w-1/5" >
               <Field as={CustomSelect}
                    label="Responsable asignado"
                    name='responsable'
                    options={responsablesOptions || []}
                    placeholder="Asigne al responsable"
                    width="100%" required          
                    />
               </div>   
               <div className="w-1/5" >
               <Field as={CustomSelect}
                    label="Forma de ejecución actividad"
                    name='formaEjecucion'
                    options={formEjecucionActividadOptions || []}
                    placeholder="Defina forma de ejecución"
                    width="100%" required          
                    />
               </div>   
           </div>
              <div className="flex justify-end space-x-3 mr-10">
                <CustomButton buttonStyle="primary" size='small' htmlType='submit' tooltipContent='Define forma de ejecución y responsable' tooltipPosition='left' 
                    icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} label='Actualizar actividad' />
                </div>
           </Form>
           )
         }}
       </Formik>
       <CustomButton buttonStyle="primary" size="small" htmlType="button" label="Volver al página anterior" tooltipContent='Volver a seleccionar otra actividad' tooltipPosition='right' 
          style={{ marginLeft:5 }} icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={ handleExit } 
       />
     </div>     
     }
    </>
    );
}
export default AdminActivityPage;