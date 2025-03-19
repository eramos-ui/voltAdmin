"use client";

import { useRouter } from "next/router";
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

import "@/public/styles/cotizar.css"; 
export default function CotizarClient() {
  // console.log('CotizarPage');
  const router                                                  = useRouter();
  const [token, setToken]                                       = useState<string | null>(null);
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
  useEffect (()=>{
    if (dataProjectActivity && typeof dataProjectActivity === "object" && "mensaje" in dataProjectActivity) {
      setMensaje(dataProjectActivity.mensaje );
      setLoading(false);
    }      
  },[dataProjectActivity])
  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.style.display = "none";
      document.body.offsetHeight; // Fuerza un reflow
      document.body.style.display = "";
    }, 100);
  
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!router.isReady) return;
    // console.log("Router está listo ✅");

    const tokenFromQuery = router.query.token;
    if (!tokenFromQuery || typeof tokenFromQuery !== "string") {
      // console.log("🔴 Token no encontrado, esperando actualización...");
      return;
    }
    // console.log("🟢 Token recibido:", tokenFromQuery);
    setToken(tokenFromQuery);

    const fetchData = async () => {
      try {
        await loadDataProjectActivityFromToken(tokenFromQuery, setDataProjectActivity);
        setLoading(false);
      } catch (err) {
        console.error("Error cargando datos:", err);
        router.push("/404");
      }
    };

    fetchData();
  }, [router.isReady, router.query.token]);

  
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
    const redirectUrl = `/gracias?accion=registrar&opcion=${opcion}`;
    alert("✅ Gracias por su cotización. Su respuesta ha sido registrada.");
    setTimeout(() => {
      if (window.opener) {
        window.close(); // 🔹 Cierra la ventana si fue abierta desde un enlace externo
      } else {
        window.location.href = redirectUrl;
      }
    }, 2000); // ⏳ Espera 2 segundos antes de salir
  }
  const handleExit=() =>{
    console.log('Exit',window.opener);
    const redirectUrl = `/gracias?accion=cancelar&opcion=${opcion}`;
    if (window.opener) {
      window.close();
    }else {
        // const url=process.env.NEXT_PUBLIC_URL;
        window.location.href = redirectUrl;
        //router.push("./gracias");
        // router.back();
         // window.location.href = "https://tu-dominio.com/gracias"; // 🔹 Redirige si no puede cerrarse
      }
  }
  const handleChangeOpcion=( value: any)=>{
      setOpcion(value);
  } 
  const handleCloseModalModificar=() =>{
    setOpenModificar(false);
  } 
  // Se calcula el costo en palabras fuera del renderizado condicional
  let costoEnPalabras=''; 
  if (costo) costoEnPalabras= numeroATexto(costo);
  if (!router.isReady || !token) {
    return <LoadingIndicator message="Cargando cotización..." />;
  }
  // console.log("Estado actual:", {
  //   token,
  //   loading,
  //   dataProjectActivity,
  //   mensaje,
  // });
  return (  // Renderizado principal
    // <div className="w-3/4 mx-auto p-6 bg-white shadow-lg rounded-lg">
    <div className="cotizar-container">
      {
        (dataProjectActivity && mensaje) &&
        <>
        <div>
          {/* Título */}
        {/* <div className="text-center mb-6"> */}
        <div className="cotizar-header">
            <CustomLabel label={`Página para ingresar su Cotización `} size='h1' />
          </div>
          {/* items-start space-x-4  */}
          {/* Bienvenida y Modificar datos */}
          {/* <div className="mb-3 flex space-x-4" style={{width:'70%'}} > */}
          <div className="cotizar-welcome-container">
            <CustomLabel label={`Bienvenido ${dataProjectActivity?.contacto}, email: ${mensaje.email}, Empresa: ${dataProjectActivity?.proveedor}`} size='normal+'  />
            <CustomButton label='Modificar datos' size='small' buttonStyle= "secondary" tooltipContent='Para actualizar los datos de su empresa' onClick={() => setOpenModificar(true)}/>
          </div>
           {/* Opciones de acción */}
          {/* <div style={{ padding: "10px", maxWidth: "1400px" }}> */}
          <div className="cotizar-options-container">         
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
          {/* </div>   */}
           {/* Botón de ayuda */}   
           {/* <div className="mb-4 flex justify-end"> */}
            <CustomButton label='...' icon={<FontAwesomeIcon icon={faQuestion} size="lg" color="white" />} size='small' buttonStyle= "primary" 
             tooltipContent='Instrucciones para el uso de la página' iconPosition="right" onClick={() => setOpenHelp(true)} style={{width:'50px'}}      
            />
          </div> 
          {/* Formulario Cotizar */}
          { opcion==='cotizar' &&
            <>
              {/* <div className="mb-3 flex items-start text-2xl space-x-4 "> */}
              {/* <div className="mb-4 flex items-center space-x-4"> */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <CustomInput label={`Valor por ${dataProjectActivity?.actividad} ($)`} captionPosition='left' value={costo} required={true}
                    placeholder='Ingrese valor en pesos' type='number' width='180px' formatNumber={true} useDecimals={false}
                    onChange={(e) => setCosto(Number(e.target.value.replace(/\./g, "")))}
                  /> 
                   {costo && costo >= 0 && <CustomLabel size="normal" label={`${numeroATexto(costo)} pesos.`} fontColor={"black"} />}
              </div>                  
              <div className="mb-3 flex items-start space-x-8">
              {/* <div className="mb-4 flex items-center space-x-6"> */}
                  <CustomInput label='Observación adicional que desee agregar' width="80%"  value={observacion} theme="light"
                      onChange={(e) => handleObservacionChange( e.target.value)} maxLength={300} rows={2} multiline={true} placeholder='Aclaraciones sobre su oferta'
                  />  
                  <div className="cotizar-file-container">
                    <CustomLabel label="Anexo opcional con detalle oferta (pdf)" size="normal+" />
                    <CustomFileInput
                        // label="Anexo opcional con detalle oferta (pdf)"
                        label=""
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
              </div>        
            </>
          }
          {/* Formulario Aclarar */}
          {opcion === 'aclarar' &&
              <div className="mb-3" style={{width:700}}>
                <CustomInput label='Ingrese su solicitud de aclaración ' width="100%"  value={aclaracion} theme="light"
                    onChange={(e) => handleAclaracionChange( e.target.value)} maxLength={300} rows={3} multiline={true} placeholder='Aclaraciones que solicita'
                /> 
              </div>
          }
          {/* Botones de acción */}
          {/* <div className="mt-3 flex items-start "> */}
          {/* <div className="mt-6 flex justify-between"> */}
          <div className="cotizar-buttons">
            <CustomButton buttonStyle="primary" size="small" htmlType="button" label={(opcion==='cotizar')?"Cancelar ingreso":"Salir de la página" }
              tooltipContent='Con este botón sale de esta página y podrá ingresar posteriormente'
              tooltipPosition='top' style={{ marginLeft:2 }} icon={<FontAwesomeIcon icon={faSignOutAlt} size="lg" color="white" />} onClick={ handleExit }
            />
            <CustomButton buttonStyle="primary" size="small" htmlType="button" label={(opcion==='cotizar')?"Registra cotización":'Solicitar aclaración'} 
              tooltipContent={(opcion==='cotizar')?'Con este botón envía su cotización y cierra esta oferta':'Con este botón registra y solicita una aclaración'}
              tooltipPosition='right' style={{ marginLeft:50 }} icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} onClick={ handleSave }
            />
          </div>
        </div>
        </>
      }  
      <HelperPage pageId='cotizar' openHelp={openHelp}  handleCloseModal={() => setOpenHelp(false)} nroHelpers={1}/>
      { dataProjectActivity && 
        <ModificarProveedorPage openModificar={openModificar} handleCloseModal={handleCloseModalModificar} razonSocial={dataProjectActivity?.proveedor} 
           contacto={dataProjectActivity.contacto} email={dataProjectActivity.mensaje.email} idProveedor={dataProjectActivity.idProveedor}
        />
      }
    </div>
  );
}
