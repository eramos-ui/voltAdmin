"use client";
import { notFound, useRouter, useSearchParams  } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadDataProjectActivityFromToken } from '../utils/apiHelpers';
import { ProjectActivityType } from '@/types/interfaces';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { CustomButton, CustomFileInput, CustomInput, CustomLabel } from '../components/controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faQuestion, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { numeroATexto } from '../utils/numeroATexto';
import CustomModal from '../components/CustomModal';

const CotizarPage = () => {
  const router                                                  = useRouter();
  const searchParams                                            = useSearchParams();
  const token                                                   = String(searchParams?.get("token"));
  const [ loading, setLoading ]                                 = useState(true);
  const [ dataProjectActivity, setDataProjectActivity ]         = useState<ProjectActivityType>( );
  const [ mensaje, setMensaje ]                                 = useState<{email:string, asunto:string,cuerpo:string}>();
  const [ costo, setCosto ]                                     = useState<number>();
  const [ observacion, setObservacion ]                         = useState<string>('');
  const [ anexo, setAnexo ]                                     = useState<string>('');
  const [ file, setFile ]                                       = useState<File>();
  const [ openHelp, setOpenHelp ]                               = useState<boolean>(false);
  
  //const [ gracias, setGracias ]                                 = useState(false);
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
          //console.log('dataProjectActivity.mensaje);', dataProjectActivity);
        }     
  },[]);
  // useEffect(() => {
  //   if (openHelp) {
  //     document.body.style.overflow = "hidden"; // 🔹 Evita que la página se desplace al abrir el modal
  //   } else {
  //     document.body.style.overflow = "auto"; // 🔹 Reactiva el scroll al cerrar
  //   }  
  //   return () => {
  //     document.body.style.overflow = "auto"; // 🔹 Limpieza al desmontar el modal
  //   };
  // }, [openHelp]);
  const handleHelp=()=>{
      // console.log('help'); 
      setOpenHelp(true);
      
  }
  const handleValueChange =( value:string) =>{
    const numericValue = Number(value.replace(/\./g, ""));
    setCosto(numericValue);  
  }
  const handleObservacionChange=( value:any) =>{
    setObservacion(value);  
  }
  const handleFileUpload=(file: File) =>{
     //console.log('en handleFileUpload');
     setFile(file); 
  }
  const handleSave=() =>{
    let message='';
    if (!costo || costo<=0) message='Debe ingresar un valor';
    if (message.length > 3 ){
      alert(`Debe ingresa como mínimo el valor de su oferta.`);
      return;
    }
    // console.log('handleSave', costo);
    // console.log('observacion',observacion);
    // console.log('file',file);
    // console.log(window.opener);
    // localStorage.removeItem("user");
    // sessionStorage.removeItem("event");
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
    window.close();
  }
  const handleCloseModal=()=>{
    console.log('cerrando modal enhandleCloseModal');
    setOpenHelp(false);
  }
  if ( loading ){ return <LoadingIndicator message={'cargando'} />;   }
  let costoEnPalabras=''; if (costo) costoEnPalabras= numeroATexto(costo);
  // if (openHelp ) {
  //   return (
  //     <div className="mb-4 flex items-center space-x-4" >
  //         <CustomModal isOpen={ openHelp } onClose={handleCloseModal} height='70vh'
  //             title="Instrucciones para uso de la página" 
  //         > 
  //          <CustomLabel label='Contenido del modal' />
  //         </CustomModal>

  //     </div>
  //   )
  // }
return (
  <>
    {
      (dataProjectActivity && mensaje) &&
    <div >
      <div>
        <CustomLabel label={`Página para ingresar su Cotización `} size='h1'  />
      </div>
      <div className="mb-3 flex items-start space-x-4 " >
        <CustomLabel label={`Bienvenido ${dataProjectActivity?.contacto}, email: ${mensaje.email}, Empresa: ${dataProjectActivity?.proveedor}`} size='normal+'  />
        <CustomButton label='Modificar datos' size='small' buttonStyle= "secondary" tooltipContent='Para actualizar los datos de su empresa'/>
      </div>
      <div className="mb-3 flex items-start text-2xl space-x-4 ">
          <CustomInput label={`Valor por ${dataProjectActivity?.actividad} ($)`} captionPosition='left' value={costo} required={true}
            placeholder='Ingrese valor en pesos' type='number' width='180px'  onChange={(e) => handleValueChange( e.target.value)}
            formatNumber={true} useDecimals={false}
          /> 
          { costo && costo>=0 &&
            <CustomLabel size='normal' style={{ marginTop:20  }} label={`${costoEnPalabras} pesos.`} fontColor={'black'}/>
          }
      </div>    
      <div>
        <CustomButton label='...' icon={<FontAwesomeIcon icon={faQuestion} size="lg" color="white" />} size='small' buttonStyle= "secondary" 
         tooltipContent='Instrucciones para el uso de la página' iconPosition="right" onClick={handleHelp}
        />
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
              //value={values[col.field]}
              onUploadSuccess={(file: File | null) => {
                  if (file) {
                      console.log(`📂 Archivo subido :`, file.name);
                      setAnexo( file.name);
                      handleFileUpload(file);
                  }
              }}
          />
      </div>
      <div className="mt-3 flex items-start ">
        <CustomButton buttonStyle="primary" size="small" htmlType="button" label="Cancelar ingreso" tooltipContent='Con este botón sale de esta página y podrá ingresar posteriormente'
          tooltipPosition='top' style={{ marginLeft:5 }}icon={<FontAwesomeIcon icon={faSignOutAlt} size="lg" color="white" />} onClick={ handleExit }
        />
        <CustomButton buttonStyle="primary" size="small" htmlType="button" label="Registra cotización" tooltipContent='Con este botón envía su cotización y cierra esta oferta'
          tooltipPosition='right' style={{ marginLeft:5 }}icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} onClick={ handleSave }
        />
      </div>
    </div>
    }
    {/* 📌 Modal siempre dentro del DOM pero se muestra u oculta con isOpen */}
    {openHelp &&
      <CustomModal isOpen={openHelp} onClose={handleCloseModal} height='70vh' title="Instrucciones para uso de la página">
        <CustomLabel label='Contenido del modal' />
      </CustomModal>

    }
  </>
);
}
export default CotizarPage;