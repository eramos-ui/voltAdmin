"use client";

import { useRouter, useSearchParams  } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Field, Form, Formik, useFormikContext  } from 'formik';
import * as Yup from "yup";;
import { loadDataActivityWithFilesAndEmails } from '@/app/services/loadPages/loadDataActivityWithFilesAndEmails';
import { ActivityEmailFilesType,  GridRowType,  OptionsSelect } from '@/types/interfaces';
import { LoadingIndicator } from '../../components/general/LoadingIndicator';
import { CustomButton, CustomDate, CustomInput, CustomLabel, SelectFormikSingle } from '../../components/controls';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faSave, faCancel, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { compareTwoObj } from '@/utils/compareTwoObj';
import { separarCamelPascalCase } from '@/utils/separarCamelPascalCase';
import { EmailTemplateSelection, PreviewEmail, ProveedorSelection } from './components';
import { replacePlaceholders } from '@/utils/replacePlaceholders';
import { SendEmailButton } from './components/SendEmailButton';
import { sendingEmails } from '../services/projectEmails/sendEmailAndRegister';
import { ConsultaCotizaciones } from './ConsultaCotizaciones';
import { useMenu } from '@/context/MenuContext';

const validationSchema = Yup.object({
    proveedoresSelected: Yup.array().min(1, "Debe seleccionar al menos un proveedor"),
    selectedTemplate: Yup.object().nullable().required("Debe seleccionar una plantilla"),
});
interface Row {//para consulta de cotizaciones enviadas
  idProjectActivity: number;
  idProject: number;
  idActivity: number;
  contacto: string;
  nombreProveedor: string;
  emailProveedor: string;
  createdAt: string;
  actividad: string;
  
}
// console.log('en ElijeProveedoresPage');
const ElijeProveedoresPage = () => {
    const router                                                    = useRouter();
    const searchParams                                              = useSearchParams();
    const { data: session, status }                                 = useSession();
    const [ loading, setLoading             ]                       = useState(true);
    const [ sendingEmail, setSendingEmail   ]                       = useState(false);
    const [ showConsulta, setShowConsulta   ]                       = useState(false);
    const [ proveedoresOptions, setProveedoresOptions ]             = useState<OptionsSelect[]>();
    const [ filesOptions, setFilesOptions   ]                       = useState<OptionsSelect[]>();
    const [ emailOptions, setEmailOptions   ]                       = useState<OptionsSelect[]>();
    const [ editableBody, setEditableBody   ]                       = useState("");
    // const [ editableAsunto, setEditableAsunto   ]                   = useState("");
    const idTask                                                    = Number(searchParams?.get("idTask"));
    const [ proveedorEdit, setProveedorEdit ]                       = useState<string>('');//fuera de formik
    const [ placeholders, setPlaceholders   ]                       = useState<Record<string, string>>({ });//fuera de formik
    const [ asuntoPlaceholders, setAsuntoPlaceholders   ]           = useState<Record<string, string>>({ });//fuera de formik
    // const [ rows, setRows ]                                         = useState<GridRowType[]>([]);//para consulta de cotizaciones enviadas
    const [ initialValues, setInitialValues ]                       = useState <ActivityEmailFilesType>({
        numActividad:'', actividad:'', fechaInicio: '' ,fechaTermino:'', duracion: 0 ,presupuesto:0,idTask:0, idTransaction:0,
        idProjectActivity:0, idProject: 0, projectName: '', userResponsable:'', formaEjecucion:'', periodoControl:'', userEjecutor:'',
        ubicacionPanel:'',  nroInstalaciones:1, tipoTerreno:"", nivelPiedras:"", nivelFreatico:0, tipoDocumento:'ACTIVIDAD',
        jsFiles:[],emailTemplate:[], selectedTemplate:null,proveedores:[], anexosSelected:[], proveedoresSelected:[],selectedTemplateId:0,
        idProcessInstance:0, idActivity:0, FechaEntregaTrabajo:'', PlazoRespuestaCotizacion:'',attributes:[],
        editableBody:'', editableAsunto:''
     }
    );
    const { refreshMenu } = useMenu();
  const SyncFields = () => {
    const { values, setFieldValue } = useFormikContext<any>();  
    useEffect(() => {
      const proveedores=values.proveedores;
      if (values.proveedoresSelected && values.proveedoresSelected.length>0){
        const proveedoresSelected=values.proveedoresSelected.map( (proveedor:any) =>  
          { 
            const provFound=proveedores?.find((p:any) => p._id.toString() === proveedor );
            if (provFound){
              return {  value:proveedor.toString(), label:(provFound.name)?provFound.name:provFound.label }
            }
          } 
        ).filter((p:any) => !p );
        if (proveedoresSelected && proveedoresSelected.length>0){            
          setFieldValue("proveedoresSelected", proveedoresSelected);
        }
      } 
    }, [values.proveedoresSelected,values.selectedTemplateId,values.proveedores,setFieldValue]); 
    return null; // No renderiza nada
  };    
  useEffect(() => {
      const fetchData= async (idTask:number) => {
        try{
          const userEmail=session?.user.email?session?.user.email:'';  
          const userName=session?.user.name?session?.user.name:'';   
          /*Aquí lee la data de la empresa, del jefe de proyecto y la task que van en initialValues */     
          if (userEmail) await loadDataActivityWithFilesAndEmails( idTask, userEmail, userName, setInitialValues);
        }catch (err){
          console.log('error', err);
        }
      }
      setLoading(true);
      // console.log('en useEffect fetchData',idTask, session);
      if (idTask && idTask>0){//revisa si al abrir existe idTask. Esto indica completar proyecto
        fetchData(idTask);
      }
  }, [idTask, session?.user.email, session?.user.name]);
  useEffect(() => {
        if (initialValues.idProjectActivity && initialValues.idProjectActivity>0 ){
            setLoading(false);
        }
  },[initialValues.idProjectActivity]);
  useEffect(()=>{
  if (initialValues.proveedores && initialValues.proveedores.length>0 ){
    setProveedoresOptions(initialValues.proveedores.map( (proveedor: any) =>  { return { label:proveedor.name, value:proveedor._id.toString() }}));
  }
  },[initialValues.proveedores]);
  useEffect(()=>{
  if (initialValues.jsFiles && initialValues.jsFiles.length>0 )//por que hay archivos repetidos le concatena al id el nombre del archivo
      setFilesOptions(initialValues.jsFiles.map( (f: any) =>  { return { label:f.filename, value:f._id }} )); 
    //setFilesOptions(initialValues.jsFiles.map( (f: any) =>  { return { label:f.descripcion, value:f.descripcion+'-'+f._id }} )); 
  },[initialValues.jsFiles]);
  useEffect(()=>{
    // console.log('useEffect initialValues.emailTemplate',initialValues.emailTemplate);
  if (initialValues.emailTemplate && initialValues.emailTemplate.length>0 )
    setEmailOptions(initialValues.emailTemplate.map( (f: any) =>  { return { label:f.templateName, value:f.idEmailTemplate }} ));      
  },[initialValues.emailTemplate ]);
    //  useEffect(() =>{ console.log('en useEffect emailOptions',emailOptions)  },[emailOptions])
  
  const handleExit = () => {
    let confirmed=true;
    confirmed = window.confirm(String.fromCodePoint(0x26A0) +"¿Está seguro de cerrar el formulario y perder lo modificado?" );
    if (confirmed)  router.back();
  };
  if (loading) {// Calculamos valores y renderizamos el loading fuera del return
    return <LoadingIndicator message={'cargando'} />;
  }
  if (sendingEmail) {
    return <LoadingIndicator message={'enviando correos'} />;
  }
  const handlePlaceholderChange=( proveedorId:any,proveedores:any) =>{// 📌 Función para actualizar los valores de los placeholders dada la selección de un proveedor a editar
      const id=proveedorId;
    //  console.log('en handlePlaceholderChange proveedorId', proveedorId)
      if (proveedores && id !== proveedorEdit.toString()){//proveedores tiene la actual versión de los proveedores (placeholders)
      const newProveedores= proveedores.map( (proveedor:any) => proveedor.id === id ? {...proveedor, placeholders }:proveedor );  
      const sinCambios=compareTwoObj(proveedores,newProveedores);//si no hubo cambios
      if (!sinCambios){
        let confirmed=true;
        confirmed = window.confirm(String.fromCodePoint(0x26A0) +" Al cambiar de proveedor, perderá lo realizado. Para guardar presione aquí <cancelar> y luego, <guardar cambios> " );
        if (!confirmed) return;
      }  
      }
      const found=proveedores?.filter((obj:any) => obj._id.toString() === id)[0];      
      if (found){
      setProveedorEdit(id);      
      const newPlaceholders=found.placeholders;
      setPlaceholders(newPlaceholders);
      const newAsuntoPlaceholders=found.asuntoPlaceholders;
      setAsuntoPlaceholders(newAsuntoPlaceholders);
      if (id.length > 0 && found.asuntoPlaceholders && initialValues.emailTemplate && initialValues.emailTemplate.length > 0) {
        const newAsuntoEditable = replacePlaceholders(initialValues.emailTemplate[0].subjectTemplate, found.asuntoPlaceholders);
        if (asuntoPlaceholders !== newAsuntoPlaceholders) {
          setAsuntoPlaceholders(newAsuntoPlaceholders);
        }
      }         
      if (id.length > 0 && found.placeholders && initialValues.emailTemplate && initialValues.emailTemplate.length > 0) {

        const newEditableBody = replacePlaceholders(initialValues.emailTemplate[0].bodyTemplate, found.placeholders);
        if (editableBody !== newEditableBody) {
          setEditableBody(newEditableBody);
        }
      }         
    }
    }
    // 📌 Función para actualizar los valores del email, por ahora sólo se puede cambiar Observacion y las fechas de entrega del trabajo y de respuesta de cotización
  const handleTemplateChange = (values:any,key: string, value: string) => {//placeholders es Json con los metadatos, aquí los actualiza en el preview email
      //  console.log('en handleTemplateChange value', value)  
      setPlaceholders((prev) => {
        const newPlaceholders = { ...prev, [key]: value };
        if (values.selectedTemplate) {// 📌 Actualiza el editableBody cada vez que cambian los placeholders
          setEditableBody(replacePlaceholders(values.selectedTemplate.bodyTemplate, newPlaceholders));
        }
        return newPlaceholders;
      });
    };
  const handleSendEmail =  async (vals: ActivityEmailFilesType,caso:string) => {// 📌 Función para "enviar" el email      
    if (!vals.selectedTemplate) return alert("Selecciona una plantilla antes de enviar.");
    if (!vals.proveedoresSelected || vals.proveedoresSelected.length === 0 || !vals.proveedores || vals.proveedores.length === 0) return alert("Seleccione proveedores a enviar correo.");
    setSendingEmail(true);
    const finListaProveedores=(caso ==='pendiente')?'pendiente':'completada';//el otro es 'pendiente' 'completada'
    const userEmail=(session?.user.email)?session?.user.email:'';
    await sendingEmails( vals, userEmail, idTask, finListaProveedores);
    setSendingEmail(false);
    router.push('/');
    refreshMenu();//para refrescar el menú dinámico
  };
  const handleSubmit = (values: any) => {//no se ejecuta
      console.log("Formulario enviado con valores:", values);
  };
  // const handleConsultaCotizaciones = () => {
  //   console.log('Consultando cotizaciones');
  // };
  const ShowPreviewEmail =() =>{
      // console.log('en ShowPreviewEmail',proveedorEdit.length)
      const { values, setFieldValue } = useFormikContext<any>();
      if (proveedorEdit.length ===0) return null;
      return  <PreviewEmail editableBody={editableBody} values={values} placeholders={placeholders}  asuntoPlaceholders={asuntoPlaceholders} /> 
  }
  const handleShowCotizaciones= async() =>{
      try {
        const response = await fetch(`/api/projectActivity/emailStatus?idProject=${initialValues.idProject}&idProjectActivity=${initialValues.idProjectActivity}`);    
        if (!response.ok) {
            throw new Error(`Failed to fetch form data: ${response.statusText}`);
        }
        const data = await response.json();  
        // console.log('data', data);
        if (data.projectEmails.length === 0){ 
            alert('No hay cotizaciones enviadas.');
            setShowConsulta(false);
            return;
        }
        setShowConsulta(true);

        setLoading(false);
    } catch (error) {
        console.error('Error fetching email status:', error);
    }
  }
  return( // { console.log('JSX AdminActivity proveedorEdit',proveedorEdit, proveedorEdit.length) }  
    <>  
    {/* { console.log('JSX AdminActivity proveedorEdit',proveedorEdit, proveedorEdit.length) }  */}
      { showConsulta ? <ConsultaCotizaciones idProject={initialValues.idProject} idProjectActivity={initialValues.idProjectActivity} setShowConsulta={setShowConsulta}
      title={`Cotizaciones enviadas para la actividad ${initialValues.numActividad} ${initialValues.actividad} del proyecto ${initialValues.projectName}`} /> 
      :
      (
       <div className="p-4">
       <p className="text-3xl font-bold text-center" > Define proveedores de la actividad {initialValues.numActividad}</p>
       <p  className="text-2xl font-bold text-center"> {`Proceso: (N°${initialValues.idProject}) "${initialValues.projectName}"`}</p>
       <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize  onSubmit={handleSubmit} >
         {({ values, errors, touched, setFieldValue }) => {//, handleSubmit ejecución manual de handleSubmit          
        //  useEffect(() => { console.log('🔍 Formik values actualizados:', values.editableBody, values.selectedTemplateId);}, [values.editableBody,values.selectedTemplateId]); 
          const handleSaveEditValue=() =>{//para guardar el template editado 
            if (values.proveedores){
              const newProveedores= values.proveedores.map( (proveedor:any) => proveedor._id.toString() === proveedorEdit ? {...proveedor, placeholders }:proveedor );  
              const sinCambios=compareTwoObj(values.proveedores,newProveedores);//si hubo cambios
               if (!sinCambios){  
                setFieldValue("proveedores", newProveedores); setProveedorEdit('');
                setTimeout(() => { window.confirm(String.fromCodePoint(0x2705)+"Modificaciones guardadas"); window.focus();}, 0);               
               }           
            }
            setProveedorEdit('');
          }          
          const handleExitEditValue=() =>{ 
            const valuesFormik=values;
            if (valuesFormik.proveedores){
              const newProveedores= valuesFormik.proveedores.map( (proveedor:any) => proveedor._id.toString() === valuesFormik.proveedorEditing ? {...proveedor, placeholders }:proveedor );  
              const sinCambios=compareTwoObj(valuesFormik.proveedores,newProveedores);//si no hubo cambios
              let confirmed=true;  
              if (!sinCambios){ confirmed = window.confirm(String.fromCodePoint(0x26A0) +"¿Está seguro de cerrar modificaciones y perderlas?" );
                if (confirmed) return;
              }           
            }
            setProveedorEdit('');
          }
         return (
          <>            
            <Form id="emailForm" >
              <div className="mb-1 justify-center flex">
                <CustomButton buttonStyle="secondary" size="small"  label="Cotizaciones enviadas" style={{ marginTop:15 , marginLeft:30 }} 
                  icon={<FontAwesomeIcon icon={faMagnifyingGlass} size="lg" color="white" />} onClick={ handleShowCotizaciones} 
                  tooltipContent='Consultar cotizaciones ya enviadas' tooltipPosition='right'
                />
              </div>
              <div className="mb-1 flex items-start space-x-2">
                  <div className="w-3/5">
                      <Field name="actividad" type="text" as={CustomInput} label="Descripción de la actividad" placeholder="Ingresa la descripción de la actividad"
                        error={touched.actividad && errors.actividad ? errors.actividad : undefined} required theme="light" width="80%"
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
                { proveedoresOptions && proveedoresOptions.length>0 && //filesOptions &&
                  <ProveedorSelection proveedoresOptions={proveedoresOptions} filesOptions={filesOptions || []}
                  />
                }
            </div>
            <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow">
              { emailOptions &&
              <>
                <EmailTemplateSelection emailOptions={emailOptions} values={values} setFieldValue={setFieldValue} 
                  setEditableBody={setEditableBody} placeholders={placeholders} />
                {values.selectedTemplate && (
                  <div className="mb-3 mp-6 flex items-start space-x-2">  {/* 📌 Formulario de Placeholders para Editar */}
                      <>
                        <h3 className="text-lg font-semibold mt-4">✏️ Edita los Valores</h3>
                        <div className="grid grid-cols-2 gap-1 mb-4">
                        {
                        <>
                         {(values.proveedores && values.proveedores.length>0 && values.proveedoresSelected && values.proveedoresSelected.length>0) &&
                            <div className="grid-cols-3 gap-1 mb-4 ml-1" >
                              {/* <label className="block text-sm font-medium">Elija proveedor a revisar</label> */}
                              <SelectFormikSingle label='Elija proveedor a revisar' width='180px' theme="light"  name={'selectProveedor'}
                                onValueChange={(e:any) =>{ handlePlaceholderChange(e, values.proveedores)}}
                                options={values.proveedoresSelected.map((p:any) => { 
                                  const provFound=values?.proveedores?.find((pr:any) => pr._id.toString() === p );
                                  if (!provFound) { return {value:p,label:p} } 
                                  return {value:provFound._id.toString(),label:provFound.name }})
                                }
                              />
                            </div>                  
                          }
                        </>
                        }
                        </div>
                        {/* {  proveedorEdit && proveedorEdit.length>0  && */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                        {Object.keys(placeholders).map((key) =>{ //
                        // console.log('key',key,placeholders[key])                          
                          return(// 🔹 sobre la key que se puede cambiar los valores-sólo se puede cambiar Observacion y las fechas de entrega del trabajo y de respuesta de cotización
                            key !== "CotizacionURL" &&  key !== "Actividad" &&   key !== "NombreContratante" &&( key === "Observacion" // 🔹 Observacion ocupa una fila completa
                              ? <div key={key} className="col-span-2">
                                  <CustomInput label='Observación que inserta en el mensaje' width="100%" name={key} value={placeholders[key]} theme="light"                             
                                    onChange={(e:any) => { handleTemplateChange(values, key, e.target.value)}} //todos fuera de Formik
                                    maxLength={300} rows={2} multiline={true} // 🔹 Activa el modo multilínea
                                  />
                                </div>
                              : (key === "FechaEntregaTrabajo" || key === "PlazoRespuestaCotizacion") ?
                                <div key={key}>                                
                                  <label className="block text-sm font-medium">{separarCamelPascalCase(key)}</label>
                                  <Field name={key} as={CustomDate}  label="" placeholder=""
                                     theme="light" width="100%" format="dd-MM-yyyy" //esta en initialValues
                                  />      
                                </div>
                              : (key === "Contacto") ?
                                <div key={key} >                                
                                  <label className="block text-sm font-medium">{key}</label>
                                  <div className="flex items-start justify-left align-middle">
                                    <CustomLabel label={placeholders[key]} theme="light"  size='h3'  />
                                  </div>
                                </div>
                              :
                                <div key={key}>                                
                                  <label className="block text-sm font-medium">{separarCamelPascalCase(key)}</label>
                                  <CustomInput label='' width="200px" theme="light" name={key} value={placeholders[key]}
                                   onChange={(e) =>{ console.log('key',key); handleTemplateChange(values, key, e.target.value)}} />
                                </div>
                            )  
                          )
                        }
                        )}
                        </div>
                        {/* } */}
                      </>
                  </div>
                )}
                { proveedorEdit && proveedorEdit.length>0 &&
                 <div className="mt-1 mb-2 flex justify-end ">
                  <CustomButton buttonStyle="primary" size="small" htmlType="button" label="cancelar" tooltipContent='elimina y cierra cambios editados proveedor'
                      tooltipPosition='left' style={{ marginLeft:5 }}icon={<FontAwesomeIcon icon={faCancel} size="lg" color="white" />} onClick={ handleExitEditValue }
                  />
                  <CustomButton buttonStyle="primary" size="small" htmlType="button" label="aplicar cambios" tooltipContent='guardar los cambios editados'
                      tooltipPosition='left' style={{ marginLeft:5 }} icon={<FontAwesomeIcon icon={faSave} size="lg" color="white" />} onClick={handleSaveEditValue }                      
                  />
                 </div>
                }
              </>
              }
            </div>
            <SyncFields />
            </Form> 
            <>
              <ShowPreviewEmail/>
              {(values.proveedoresSelected && values.proveedoresSelected.length >0 && proveedorEdit.length === 0) &&    //📌 Botón de Enviar Email
                <SendEmailButton handleSendEmail={handleSendEmail}  />
              } 
            </>
          </>
          )
         }}
       </Formik>       
       <div className="mt-3 flex items-start ">
        <CustomButton buttonStyle="primary" size="small" htmlType="button" label="Volver al página anterior" tooltipContent='Volver a seleccionar otra actividad'
            tooltipPosition='top' style={{ marginLeft:5 }}icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={ handleExit }
        />
       </div>
       </div>
       )}
    </>
    );
};
export default ElijeProveedoresPage;