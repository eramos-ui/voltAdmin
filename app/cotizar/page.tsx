"use client";
import { notFound, useRouter, useSearchParams  } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadDataProjectActivityFromToken } from '@/utils/apiHelpers';
import { ProjectActivityType } from '@/types/interfaces';
import { LoadingIndicator } from '@/components/general/LoadingIndicator';
import { CustomButton, CustomFileInput, CustomInput, CustomLabel, CustomRadioGroup} from '@/components/controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faQuestion, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { numeroATexto } from '@/utils/numeroATexto';
import { HelperPage } from '@/components/general/Helper';
import { ModificarProveedorPage } from '@/components/cotizar/ModificarProveedor';

const CotizarPage = () => {
  const router                                                  = useRouter();
  const searchParams                                            = useSearchParams();
  const token                                                   = String(searchParams?.get("token"));
  const [ loading, setLoading ]                                 = useState(true);
  const [ dataProjectActivity, setDataProjectActivity ]         = useState<ProjectActivityType>( );
  const [ mensaje, setMensaje ]                                 = useState<{email:string, asunto:string,cuerpo:string}>();
  const [ costo, setCosto ]                                     = useState<number>();
  const [ observacion, setObservacion ]                         = useState<string>('');
  const [ aclaracion, setAclaracion ]                           = useState<string>('');
  const [ anexo, setAnexo ]                                     = useState<string>('');
  const [ file, setFile ]                                       = useState<File>();
  const [ openHelp, setOpenHelp ]                               = useState<boolean>(false);
  const [ openModificar, setOpenModificar ]                     = useState<boolean>(false);
  const [ opcion, setOpcion ]                                   = useState<string>('cotizar');
  
  if (!token) return notFound();;//404

  useEffect (()=>{
    if (dataProjectActivity && typeof dataProjectActivity === "object" && "mensaje" in dataProjectActivity) {
      setMensaje(dataProjectActivity.mensaje );
      setLoading(false);
    }      
  },[dataProjectActivity])
  useEffect(()=>{
      const fetchData= async (token:string) => {
        try{
          await loadDataProjectActivityFromToken(token,setDataProjectActivity);
        }catch (err){
          console.log('error', err);
        }
      }
      setLoading(true);
        if (token ){
          fetchData(token);           
        }     
  },[]);
  const handleHelp=()=>{
      setOpenHelp(true);      
  }
  const handleModificarDatos=()=>{
    setOpenModificar(true);
  }
  const handleValueChange =( value:string) =>{
    const numericValue = Number(value.replace(/\./g, ""));
    setCosto(numericValue);  
  }
  const handleObservacionChange=( value:any) =>{
    setObservacion(value);  
  }
  const handleAclaracionChange=( value:any) =>{
    setAclaracion(value);  
  }
  const handleFileUpload=(file: File) =>{
     setFile(file); 
  }
  const handleSave=() =>{
    let message='';
    if (!costo || costo<=0) message='Debe ingresar un valor';
    if (message.length > 3 ){
      alert(`Debe ingresa como mínimo el valor de su oferta.`);
      return;
    }
    alert("✅ Gracias por su cotización. Su respuesta ha sido registrada.");
    setTimeout(() => {
      if (window.opener) {
        window.close(); // 🔹 Cierra la ventana si fue abierta desde un enlace externo
      } else {
        const url=process.env.NEXT_PUBLIC_URL;
        window.location.href = `http://${url}/login`; // 🔹 Redirige si no puede cerrarse
      }
    }, 2000); // ⏳ Espera 2 segundos antes de salir
  }
  const handleExit=() =>{
    console.log('Exit');
    if (window.opener) {
      window.close();
    }else {
        const url=process.env.NEXT_PUBLIC_URL;
        window.location.href = `http://${url}/login`; // 🔹 Redirige si no puede cerrarse
      }
  }
  const handleCloseModal=()=>{
    setOpenHelp(false);
  }
  const handleCloseModalModificar=() =>{
    setOpenModificar(false);
  }
  const handleChangeOpcion=( value: any)=>{
      setOpcion(value);
  }
  if ( loading ){ return <LoadingIndicator message={'cargando'} />;   }
  let costoEnPalabras=''; if (costo) costoEnPalabras= numeroATexto(costo);
return (
  <>
    {
      (dataProjectActivity && mensaje) &&
    <div >
      <div>
        <CustomLabel label={`Página para ingresar su Cotización `} size='h1' />
      </div>
      {/* items-start space-x-4  */}
      <div className="mb-3 flex space-x-4" style={{width:'70%'}} >
        <CustomLabel label={`Bienvenido ${dataProjectActivity?.contacto}, email: ${mensaje.email}, Empresa: ${dataProjectActivity?.proveedor}`} size='normal+'  />
        <CustomButton label='Modificar datos' size='small' buttonStyle= "secondary" tooltipContent='Para actualizar los datos de su empresa' onClick={handleModificarDatos}/>
      </div>
      <div style={{ padding: "10px", maxWidth: "1400px" }}>
        <>
          <CustomRadioGroup
                label="Seleccione lo que quiere hacer "
                size='h2'
                options={[
                  { id: "cotizar", label: "Cotizar" },
                  { id: "aclarar", label: "Pedir una aclaración" },
                ]}
                width='100%'
                orientation="horizontal"
                defaultValue={opcion}
                onChange={(value) => handleChangeOpcion(value)}
          />
        </>
      </div>     
      <div>
        <CustomButton label='...' icon={<FontAwesomeIcon icon={faQuestion} size="lg" color="white" />} size='small' buttonStyle= "primary" 
         tooltipContent='Instrucciones para el uso de la página' iconPosition="right" onClick={handleHelp}           
        />
      </div> 
      { opcion==='cotizar' &&
        <>
          <div className="mb-3 flex items-start text-2xl space-x-4 ">
              <CustomInput label={`Valor por ${dataProjectActivity?.actividad} ($)`} captionPosition='left' value={costo} required={true}
                placeholder='Ingrese valor en pesos' type='number' width='180px'  onChange={(e) => handleValueChange( e.target.value)}
                formatNumber={true} useDecimals={false}
              /> 
              { costo && costo>=0 &&
                <CustomLabel size='normal' style={{ marginTop:20  }} label={`${costoEnPalabras} pesos.`} fontColor={'black'}/>
              }
          </div>  
            
          <div className="mb-3 flex items-start space-x-8">
              <CustomInput label='Observación adicional que desee agregar' width="100%"  value={observacion} theme="light"
                  onChange={(e) => handleObservacionChange( e.target.value)} maxLength={300} rows={2} multiline={true} placeholder='Aclaraciones sobre su oferta'
              />  
              <CustomFileInput
                  label="Anexo opcional con detalle oferta (pdf)"
                  width="100%"
                  accept=".pdf"
                  putFilenameInMessage={true}
                  onUploadSuccess={(file: File | null) => {
                      if (file) {
                          console.log(`📂 Archivo subido :`, file.name);
                          setAnexo( file.name);
                          handleFileUpload(file);
                      }
                  }}
              />
          </div>        
        </>
      }
      {opcion === 'aclarar' &&
          <div className="mb-3" style={{width:700}}>
            <CustomInput label='Ingrese su solicitud de aclaración ' width="100%"  value={aclaracion} theme="light"
                onChange={(e) => handleAclaracionChange( e.target.value)} maxLength={300} rows={3} multiline={true} placeholder='Aclaraciones que solicita'
            /> 
          </div>
      }
      <div className="mt-3 flex items-start ">
        <CustomButton buttonStyle="primary" size="small" htmlType="button" label={(opcion==='cotizar')?"Cancelar ingreso":"Salir de la página" }
          tooltipContent='Con este botón sale de esta página y podrá ingresar posteriormente'
          tooltipPosition='top' style={{ marginLeft:5 }} icon={<FontAwesomeIcon icon={faSignOutAlt} size="lg" color="white" />} onClick={ handleExit }
        />
        <CustomButton buttonStyle="primary" size="small" htmlType="button" label={(opcion==='cotizar')?"Registra cotización":'Solicitar aclaración'} 
          tooltipContent={(opcion==='cotizar')?'Con este botón envía su cotización y cierra esta oferta':'Con este botón registra y solicita una aclaración'}
          tooltipPosition='right' style={{ marginLeft:5 }} icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} onClick={ handleSave }
        />
      </div>
    </div>
    }
    {/* 📌 Modal siempre dentro del DOM pero se muestra u oculta con isOpen */}
    <HelperPage pageId='cotizar' openHelp={openHelp} handleCloseModal={handleCloseModal} nroHelpers={1}/>
   { dataProjectActivity && 
      <ModificarProveedorPage openModificar={openModificar} handleCloseModal={handleCloseModalModificar} razonSocial={dataProjectActivity?.proveedor} 
         contacto={dataProjectActivity.contacto} email={dataProjectActivity.mensaje.email} idProveedor={dataProjectActivity.idProveedor}
      />
  }
  </>
);
}
export default CotizarPage;