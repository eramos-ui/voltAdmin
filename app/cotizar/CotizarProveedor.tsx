"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense  } from 'react';
import { notFound } from "next/navigation"; // 🔹 Importa notFound()
import { useRouter, useSearchParams  } from 'next/navigation';//

import { ProjectActivityType } from '@/types/interfaces';

import { CustomButton, CustomFileInput, CustomInput, CustomLabel, CustomRadioGroup} from '@/components/controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faQuestion, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { numeroATexto } from '@/utils/numeroATexto';
import { HelperPage } from '@/components/general/Helper';
import { ModificarProveedorPage } from '@/components/ModificarProveedor';
import { LoadingIndicator } from '@/components/general/LoadingIndicator';

export default function CotizarProveedorPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
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
  // const [ data, setData ]                                       = useState<any>();
  const [ error, setError ]                                     = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/projectEmail/by-token?token=${token}`);
        if (!res.ok) {
          const result = await res.json();
          throw new Error(result.error || 'Error desconocido al obtener la actividad');
        }
        const result = await res.json();
        setDataProjectActivity(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);
  useEffect (()=>{
    if (dataProjectActivity && typeof dataProjectActivity === "object" && "mensaje" in dataProjectActivity) {
      setMensaje(dataProjectActivity.mensaje );
      setLoading(false);
    }      
  },[dataProjectActivity]);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setError('Token no encontrado en la URL.');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/projectEmail/by-token?token=${token}`);
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Error desconocido');
        }
        const result = await response.json();
         setDataProjectActivity(result);
      } catch (err: any) {
        console.log('Error al cargar la página:', err);
        setError(err.message);
      }
    };
    setLoading(true);
    fetchData();
    setLoading(false);
  }, []); 
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
        const url=process.env.NEXT_PUBLIC_DOMAIN;
        window.location.href = `http://${url}/login`; // 🔹 Redirige si no puede cerrarse
      }
    }, 2000); // ⏳ Espera 2 segundos antes de salir
  }
  const handleExit=() =>{
    console.log('Exit');
    if (window.opener) {
      window.close();
    }else {
        const url=process.env.NEXT_PUBLIC_DOMAIN;
        window.location.href = `http://${url}/login`; // 🔹 Redirige si no puede cerrarse
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
  
  // Renderizado condicional para el loading
  if (loading) {
    if (error) {
      return <div>Error al cargar la página: {error}</div>;
    }
    return <LoadingIndicator message={'cargando'} />;
  }   
  // return <h1>Hola desde cotizarProveedor. Token: {token} </h1>;
  return (
    <div className="cotizar-container">
      {
        (dataProjectActivity && mensaje) &&
        <>
          <div>          
           <div className='cotizar-header'>
            <CustomLabel label={`Página para ingresar su Cotización `} size='h1' />
           </div>
          {/* items-start space-x-4  */}
          <div className="cotizar-welcome-container"  >
            <CustomLabel label={`Bienvenido ${dataProjectActivity?.contacto}, email: ${mensaje.email}, Empresa: ${dataProjectActivity?.nombreProveedor}`} size='normal+'  />
            <CustomButton label='Modificar datos' size='small' buttonStyle= "secondary" tooltipContent='Para actualizar los datos de su empresa'
                onClick={() => setOpenModificar(true)}
            />
          </div>
          <div className="cotizar-options-container">
              <CustomRadioGroup
                    label="Seleccione lo que quiere hacer "
                    size='h3'
                    options={[
                      { id: "cotizar", label: "Cotizar" },
                      { id: "aclarar", label: "Pedir una aclaración" },
                    ]}
                    // width='75%'
                    orientation="horizontal"
                    defaultValue={opcion}
                    onChange={(value) => handleChangeOpcion(value)}
              />
            <CustomButton  label='' icon={<FontAwesomeIcon icon={faQuestion} size="lg" color="white" />} size='medium' iconPosition="right"
              buttonStyle= "secondary" tooltipContent='Instrucciones para el uso de la página' onClick={() => setOpenHelp(true)}       
            />
          </div> 
          { opcion==='cotizar' &&
            <>
              <div className="mb-3 flex items-start text-2xl space-x-4 ">
                  <CustomInput label={`Valor por ${dataProjectActivity?.actividad} ($)`} captionPosition='left' value={costo} required={true}
                    placeholder='Ingrese valor en pesos' type='number' width='180px' formatNumber={true} useDecimals={false}
                    onChange={(e) => setCosto(Number(e.target.value.replace(/\./g, "")))}
                  /> 
                   {costo && costo >= 0 && <CustomLabel size="normal" label={`${numeroATexto(costo)} pesos.`} fontColor={"black"} />}
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
      
        </>
      }
      {/* 📌 Modal siempre dentro del DOM pero se muestra u oculta con isOpen */}
      <HelperPage pageId='cotizar' openHelp={openHelp}  handleCloseModal={() => setOpenHelp(false)} nroHelpers={1}/>
      {/* { dataProjectActivity && 
        <ModificarProveedorPage openModificar={ openModificar} handleCloseModal={handleCloseModalModificar} razonSocial={dataProjectActivity?.nombreProveedor} 
           contacto={dataProjectActivity.contacto} email={dataProjectActivity.mensaje.email} idProveedor={dataProjectActivity.idProveedor}
        />
      } */}
      { dataProjectActivity && mensaje && 
        <ModificarProveedorPage openModificar={ openModificar} handleCloseModal={handleCloseModalModificar} razonSocial={dataProjectActivity?.nombreProveedor} 
         contacto={dataProjectActivity.contacto} email={mensaje.email} idProveedor={dataProjectActivity.idProveedor}
        />
      }
    </div>
  );
}
