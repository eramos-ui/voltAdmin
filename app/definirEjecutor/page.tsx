"use client";

import { useRouter, useSearchParams  } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'
import * as Yup from "yup";;
import { loadDataActivity } from '@/utils/apiHelpers';
import { ActivityType, OptionsSelect } from '@/types/interfaces';
import { LoadingIndicator } from '../../components/general/LoadingIndicator';
import { Field, Form, Formik } from 'formik';
import { CustomButton, CustomDate, CustomInput, CustomLabel, CustomSelect } from '../../components/controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faHome } from '@fortawesome/free-solid-svg-icons';
import { loadEjecutores } from '@/utils/loadEjecutores';
import { plazoControlOptions } from '@/data/selectType';

const validationSchema = Yup.object({
    formaEjecucion: Yup.string().required("La forma de ejecución de la actividad es obligatoria"),
    responsable: Yup.string().required("Seleccione el responsable de la actividad"),

  });

const DefineEjecutorPage = () => {
    const router                                                  = useRouter();
    const searchParams                                            = useSearchParams();
    const { data: session, status }                               = useSession();
    const [ userEmail, setUserEmail ]                             = useState<string>('');
    const [ loading, setLoading ]                                 = useState(true);
    const [ ejecutoresOptions, setEjecutoresOptions ]             = useState<OptionsSelect[]>();
    const menuId                                                  = Number(searchParams?.get("menuId"));
    const idTask                                                  = Number(searchParams?.get("idTask"));
    const [ initialValues, setInitialValues ]                     = useState <ActivityType>({ 
        numActividad:'', actividad:'', fechaInicio: '' ,fechaTermino:'', duracion: 0 ,presupuesto:0,idTask:0, idTransaction:0,
        idProjectActivity:0, idProject: 0, projectName: '', responsable:'', formaEjecucion:'', periodoControl:'', ejecutor:'',
        ubicacionPanel:'',  nroInstalaciones:1, tipoTerreno:"", nivelPiedras:"", nivelFreatico:0, 
     } 
    );
    
    //console.log('menuId,idTask',menuId,idTask);
    useEffect(()=>{
        const cargaEjecutores=async () => setEjecutoresOptions( await loadEjecutores());
        cargaEjecutores();     
    },[])
    useEffect(() => {
        const fetchData= async (idTask:number) => {
        try{
          if (session?.user.id)  await loadDataActivity(idTask,session.user.id,setInitialValues);
        }catch (err){
          console.log('error', err);
        }
      }  
      setLoading(true);
      if (idTask && idTask>0){//revisa si al abrir existe idTask. Esto indica completar proyecto
        fetchData(idTask);  
      }     
     }, [idTask, session]); 
     useEffect(() => { 
        if (initialValues.idProjectActivity && initialValues.idProjectActivity>0 ){
            setLoading(false);
            // console.log('use Effect initialValues',initialValues);
        }

     },[initialValues.idProjectActivity]);
     const handleExit = () => {
            router.back()   
      };  
     if ( loading ){  
        return <LoadingIndicator   message='cargando' />;        
     }
  return(
    <>
    {/* { console.log('JSX AdminActivity initialValues',loading,initialValues.fechaInicio, initialValues.fechaTermino) } */}
     { !loading &&
     <div className="p-4">
       <p className="text-3xl font-bold text-center" > {`Define ejecutor de la actividad ${initialValues.numActividad}`}</p>
       <p className="text-2xl font-bold text-center"> {`Proceso: (N°${initialValues.idProject}) “${initialValues.projectName}”`}</p>
       {/* <p  className="text-2xl font-bold text-center"> `Proceso: (N°${initialValues.idProject}) "${initialValues.projectName}"`</p> */}
       <Formik
         initialValues={initialValues}
         validationSchema={validationSchema}
         enableReinitialize
         onSubmit={(values) => { console.log('submit',values);   }}         //updateActivity(values,userEmail); router.back();
       >
         {({ values, errors, touched, setFieldValue, resetForm }) => { 
        //   useEffect(()=>{
        //       if ( selectedRow ){
        //           const currentActivity = selectedRow["NumActividad"].toString();
        //           const existingIds = new Set(values.activities?.map((row) => String(row["NumActividad"]))); 
        //           setNextActivityToAdd( getNextActivityId(currentActivity,existingIds));
        //       }
        //     },[selectedRow])

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
                required theme="light" width="100%" format="dd-MM-yyyy" //onChange={(e:any) => setFieldValue("fechaInicio", e.target.value)}
                />
            </div>
            <div className="w-1/5">
                <Field name="fechaTermino" as={CustomDate} label="Fecha de término" placeholder="Ingresa la fecha de término"
                required theme="light" width="100%" format="dd-MM-yyyyy" onChange={(e:any) => setFieldValue("fechaInicio", e.target.value)}
                />
            </div>
            <div className="w-1/5" >
                <CustomLabel label={`(Duración en días: ${values.duracion}) `} size='normal+' 
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
                    label="Ejecutor asignado"
                    name='ejecutor'
                    options={ejecutoresOptions || []}
                    placeholder="Asigne al responsable"
                    width="100%" required          
                    />
               </div>   
               <div className="w-1/5" >
               <Field as={CustomSelect}
                    label="Periodo control"
                    name='periodoControl'
                    options={plazoControlOptions || []}
                    placeholder="Defina periodo control"
                    width="100%" required          
                    />
               </div>   
           </div>
              <div className="flex justify-end space-x-3 mr-10">
                <CustomButton buttonStyle="primary" size='small' htmlType='submit' tooltipContent='Define ejecutor de la actividad' tooltipPosition='left' 
                    icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} label='Actualizar actividad' />
                </div>
           </Form>
           )
         }}
       </Formik>
       <CustomButton buttonStyle="primary" size="small" htmlType="button" label="Volver al página anterior" tooltipContent='Volver a seleccionar otra actividad' tooltipPosition='right' 
          style={{ marginLeft:5 }}icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={ handleExit } 
       />
     </div>     
     }
    </>
    );
};
export default DefineEjecutorPage;
