"use client";

import { useRouter, useSearchParams  } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Field, Form, Formik } from 'formik';
import * as Yup from "yup";;
import {  loadDataActivityWithFilesAndEmails, saveProveedorToken, sendingEmails } from '@/utils/apiHelpers';
import { ActivityEmailFilesType,  OptionsSelect } from '@/types/interfaces';
import { LoadingIndicator } from '../../components/general/LoadingIndicator';
import { CustomButton, CustomDate, CustomInput, CustomLabel, CustomSelect } from '../../components/controls';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { compareTwoObj } from '@/utils/compareTwoObj';
import { separarCamelPascalCase } from '@/utils/separarCamelPascalCase';
import { EmailTemplateSelection, PreviewEmail, ProveedorSelection } from './components';
import { replacePlaceholders } from '@/utils/replacePlaceholders';
import { SendEmailButton } from './components/SendEmailButton';

const validationSchema = Yup.object({
    proveedoresSelected: Yup.array().min(1, "Debe seleccionar al menos un proveedor"),
    selectedTemplate: Yup.object().nullable().required("Debe seleccionar una plantilla"),
});

const ElijeProveedoresPage = () => {
    const router                                                  = useRouter();
    const searchParams                                            = useSearchParams();
    const { data: session, status }                               = useSession();
    const [ loading, setLoading ]                                 = useState(true);
    const [ sendingEmail, setSendingEmail ]                       = useState(false);
    const [ proveedoresOptions, setProveedoresOptions ]           = useState<OptionsSelect[]>();
    const [ filesOptions, setFilesOptions ]                       = useState<OptionsSelect[]>();
    const [ emailOptions, setEmailOptions ]                       = useState<OptionsSelect[]>();
    const [ editableBody, setEditableBody ]                       = useState("");
    const idTask                                                  = Number(searchParams?.get("idTask"));
    const [ proveedorEdit, setProveedorEdit ]                     = useState<number>(0);
    const [ placeholders, setPlaceholders ]                       = useState<Record<string, string>>({ });
    const [ initialValues, setInitialValues ]                     = useState <ActivityEmailFilesType>({
        numActividad:'', actividad:'', fechaInicio: '' ,fechaTermino:'', duracion: 0 ,presupuesto:0,idTask:0, idTransaction:0,
        idProjectActivity:0, idProject: 0, projectName: '', responsable:'', formaEjecucion:'', periodoControl:'', ejecutor:'',
        ubicacionPanel:'',  nroInstalaciones:1, tipoTerreno:"", nivelPiedras:"", nivelFreatico:0, jsFiles:[],emailTemplate:[],
        selectedTemplate:null,proveedores:[], anexosSelected:[], proveedoresSelected:[],selectedTemplateId:0,
     }
    );
    useEffect(() => {
      const fetchData= async (idTask:number) => {
        try{
          if (session?.user.id)  await loadDataActivityWithFilesAndEmails(idTask,session.user.id, setInitialValues);
        }catch (err){
          console.log('error', err);
        }
      }
      setLoading(true);
      if (idTask && idTask>0){//revisa si al abrir existe idTask. Esto indica completar proyecto
        fetchData(idTask);
      }
     }, []);
     useEffect(() => {
        if (initialValues.idProjectActivity && initialValues.idProjectActivity>0 ){
            setLoading(false);
        }
     },[initialValues.idProjectActivity]);
     useEffect(()=>{
      if (initialValues.proveedores && initialValues.proveedores.length>0 )
        { setProveedoresOptions(initialValues.proveedores.map( (proveedor: any) =>  { return { label:proveedor.label, value:proveedor.id }} ));  }
     },[initialValues.proveedores]);
     useEffect(()=>{
        if (initialValues.jsFiles && initialValues.jsFiles.length>0 )
        {
          setFilesOptions(initialValues.jsFiles.map( (f: any) =>  { return { label:f.descripcion, value:f.id }} ));
        }
     },[initialValues.jsFiles]);
     useEffect(()=>{
      if (initialValues.emailTemplate && initialValues.emailTemplate.length>0 )
      {
        setEmailOptions(initialValues.emailTemplate.map( (f: any) =>  { return { label:f.templateName, value:f.idEmailTemplate }} ));
      }
     },[initialValues.emailTemplate ]);
     const handleExit = () => {
       let confirmed=true;
       confirmed = window.confirm(String.fromCodePoint(0x26A0) +"¿Está seguro de cerrar el formulario y perder lo modificado?" );
       if (confirmed)  router.back();
      };
     if ( loading ){ return <LoadingIndicator message={'cargando'} />;   }
     const handlePlaceholderChange=( values:any,val:any) =>{ // 📌 Función para actualizar los valores de los placeholders
      const id=Number(val);
      if (values.proveedores && id !== proveedorEdit){
        const newProveedores= values.proveedores.map( (proveedor:any) => proveedor.id === proveedorEdit ? {...proveedor, placeholders }:proveedor );  
        const sinCambios=compareTwoObj(values.proveedores,newProveedores);//si no hubo cambios
        if (!sinCambios){
          let confirmed=true;
          confirmed = window.confirm(String.fromCodePoint(0x26A0) +" Al cambiar de proveedor, perderá lo realizado. Para guardar presione aquí <cancelar> y luego, <guardar cambios> " );
          if (!confirmed) return;
        }  
      }
      const found=values.proveedores?.filter((obj:any) => obj.id === id)[0];      
      if (found){
        setProveedorEdit(id);
        const newPlaceholders=found.placeholders;
        setPlaceholders(newPlaceholders);
      }
     }
    // 📌 Función para actualizar los valores del email
     const handleTemplateChange = (values:any,key: string, value: string) => {//placeholders es Json con los metadatos, aquí los actualiza en el preview email
        setPlaceholders((prev) => {
          const newPlaceholders = { ...prev, [key]: value };
          if (values.selectedTemplate) {// 📌 Actualiza el editableBody cada vez que cambian los placeholders
            setEditableBody(replacePlaceholders(values.selectedTemplate.bodyTemplate, newPlaceholders));
          }
          return newPlaceholders;
        });
      };
     const handleSendEmail =  async (vals: ActivityEmailFilesType) => {// 📌 Función para "enviar" el email      
      if (!vals.selectedTemplate) return alert("Selecciona una plantilla antes de enviar.");
      if (!vals.proveedoresSelected || vals.proveedoresSelected.length === 0 || !vals.proveedores || vals.proveedores.length === 0) return alert("Seleccione proveedores a enviar correo.");
      setSendingEmail(true);
      const userId=(session?.user.id)?session?.user.id:0;
      await sendingEmails( vals, userId, idTask)
       setSendingEmail(false);
       router.push('/');
      };
      const handleSubmit = (values: any) => {//no se ejecuta
        console.log("Formulario enviado con valores:", values);
      };
      if (sendingEmail){
        return <LoadingIndicator message={'enviando correos'} />;
      }
  return(
    <>  {/* { console.log('JSX AdminActivity initialValues',loading,proveedoresOptions) } */}
     { !loading &&
     <div className="p-4">
       <p className="text-3xl font-bold text-center" > Define proveedores de la actividad {initialValues.numActividad}</p>
       <p  className="text-2xl font-bold text-center"> Proceso: (N°{initialValues.idProject}) "{initialValues.projectName}"</p>
       <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize  onSubmit={handleSubmit} >
         {({ values, errors, touched, setFieldValue }) => {//, handleSubmit ejecución manual de handleSubmit
          const handleSaveEditValue=() =>{
            if (values.proveedores){
              const newProveedores= values.proveedores.map( proveedor => proveedor.id === proveedorEdit ? {...proveedor, placeholders }:proveedor );  
              const sinCambios=compareTwoObj(values.proveedores,newProveedores);//si no hubo cambios
              if (!sinCambios){    setFieldValue("proveedores", newProveedores);  setProveedorEdit(0);
                setTimeout(() => { window.confirm(String.fromCodePoint(0x2705)+"Modificaciones guardadas"); window.focus();}, 0);
              }           
            }
         }
         useEffect(()=>{
              if ( proveedorEdit>0 ){ if (placeholders ){ setEditableBody(replacePlaceholders(values.emailTemplate[0].bodyTemplate, placeholders)); } }
          },[proveedorEdit])
          const handleExitEditValue=() =>{ 
            if (values.proveedores){
              const newProveedores= values.proveedores.map( proveedor => proveedor.id === proveedorEdit ? {...proveedor, placeholders }:proveedor );  
              const sinCambios=compareTwoObj(values.proveedores,newProveedores);//si no hubo cambios
              let confirmed=true;  
              if (!sinCambios){ confirmed = window.confirm(String.fromCodePoint(0x26A0) +"¿Está seguro de cerrar modificaciones y perderlas?" );
                if (confirmed) return;
              }           
            }
            setProveedorEdit(0);
          }
         return (
          <>
            <Form id="emailForm" >
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
                { proveedoresOptions && proveedoresOptions.length>0 && filesOptions &&
                  <ProveedorSelection proveedoresOptions={proveedoresOptions} filesOptions={filesOptions} />
                }
            </div>
            <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow">
                  { emailOptions &&
                  <>
                    <EmailTemplateSelection emailOptions={emailOptions} values={values} setFieldValue={setFieldValue} setEditableBody={setEditableBody} 
                     placeholders={placeholders} />
                    {values.selectedTemplate && (
                      <div className="mb-3 mp-6 flex items-start space-x-2">  {/* 📌 Formulario de Placeholders para Editar */}
                          <>
                            <h3 className="text-lg font-semibold mt-4">✏️ Edita los Valores</h3>
                            <div className="grid grid-cols-2 gap-1 mb-4">
                            {
                            <>
                              { (values.proveedores &&  values.proveedoresSelected && values.proveedores.length>0 &&  values.proveedoresSelected.length>0 ) &&
                                <div className="grid-cols-3 gap-1 mb-4 ml-1" >
                                  <label className="block text-sm font-medium">Elija proveedor a revisar</label>
                                  <CustomSelect label='' width='180px' theme="light" value={String(proveedorEdit) } onChange={(e) =>  handlePlaceholderChange(values, e)}
                                      options={values.proveedores.filter((obj:any) => values.proveedoresSelected.includes(obj.id)).map((pr:any) => { return {value:pr.id,label:pr.label }})}
                                  />
                                </div>
                              }
                            </>
                            }
                            </div>
                            {  proveedorEdit>0  &&
                            <div className="grid grid-cols-2 gap-3 mb-4">
                            {Object.keys(placeholders).map((key) =>
                              key !== "CotizacionURL" &&  key !== "Actividad" &&   key !== "NombreContratante" &&(key === "Observacion"  //// 🔹 Observacion ocupa una fila completa
                                ? <div key={key} className="col-span-2">
                                   <CustomInput label='Observación que inserta en el mensaje' width="100%" name={key} value={placeholders[key]} theme="light"
                                      onChange={(e) => handleTemplateChange(values, key, e.target.value)} maxLength={300} rows={2} multiline={true} // 🔹 Activa el modo multilínea
                                   />
                                  </div>
                               :  <div key={key}>
                                   <label className="block text-sm font-medium">{separarCamelPascalCase(key)}</label>
                                   <CustomInput label='' width="200px" theme="light" name={key} value={placeholders[key]} onChange={(e) => handleTemplateChange(values, key, e.target.value)} />
                                  </div>
                              )
                            )}
                            </div>
                            }
                          </>
                      </div>
                    )}
                    { proveedorEdit>0 &&
                     <div className="mt-1 mb-2 flex justify-end ">
                      <CustomButton buttonStyle="secondary" size="small" htmlType="button" label="cancelar" tooltipContent='elimina y cierra cambios editados proveedor'
                          tooltipPosition='top' style={{ marginLeft:5 }}icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={ handleExitEditValue }
                      />
                      <CustomButton buttonStyle="secondary" size="small" htmlType="button" label="aplicar cambios" tooltipContent='guardar los cambios editados'
                          tooltipPosition='top' style={{ marginLeft:5 }}icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={handleSaveEditValue }
                      />
                     </div>
                    }
                  </>
                  }
                </div>
            </Form> 
            {(values.selectedTemplate && values.proveedoresSelected && proveedorEdit>0) && <PreviewEmail editableBody={editableBody} values={values} placeholders={placeholders} /> }
            {proveedorEdit === 0 && <SendEmailButton handleSendEmail={handleSendEmail}  />}   {/* 📌 Botón de Enviar Email */}
          </>
          )
         }}
       </Formik>
       <div className="mt-3 flex items-start ">
        <CustomButton buttonStyle="primary" size="small" htmlType="button" label="Volver al página anterior" tooltipContent='Volver a seleccionar otra actividad'
            tooltipPosition='right' style={{ marginLeft:5 }}icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={ handleExit }
        />
       </div>
     </div>
     }
    </>
    );
};
export default ElijeProveedoresPage;