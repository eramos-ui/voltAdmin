"use client";
import { useEffect, useState } from 'react';
import GoHomeButton from '@/components/general/GoHomeButton';
import { useRouter } from 'next/navigation';

import { Formik, Form } from 'formik'; 
import { getInitialValuesDynamicForm } from '@/utils/initialValues';
import { FormConfigType, GridRowType } from '@/types/interfaces';

import { FormRow } from '@/components/controls';

import {  getValidationSchemaDynamicForm } from '@/utils/validationSchema';
import { LoadingIndicator } from '@/components/general/LoadingIndicator';
/* Renderiza cualquier form en la BD Form del los que tiene formId en la tabla Submenu y path con número /12 x ej.
Los componente en secuencia son 1) esta página a través de 2) FormRow que utiliza 3) FieldComponent para renderizar cada campo
Este componente consume sp: getSubMenuForm (@subMenuId) y extrae el campo jsonForm de la tabla Form con el type FormConfigType
*/
const FormPage = ({ params }: { params: { subMenuId: string } }) => {
  const [ formData, setFormData ] = useState<FormConfigType | null>(null);//los campos del formulario dynamic
  const [ loading, setLoading ]   = useState(true);
  const [ error, setError ]       = useState<string | null>(null);
  const [ gridRows, setGridRows ] = useState<GridRowType[]>( []);
  const router                    = useRouter();
  const subMenuId = params?.subMenuId ? parseInt(params.subMenuId, 10) : 0;//el id del subMenu con el type FormConfigType
  //console.log('FromPage')
  let initialValues: { [key: string]: any } = {};
  useEffect(()=>{
     console.log('useEffect formData',formData);
  },[formData])
  
  useEffect(() => {
    async function fetchData() {
      if (subMenuId === 0) {
        setError('No valid subMenuId provided');
        setLoading(false);
        return;
      }  
      let data:FormConfigType;
      try {
        //console.log('lee menú',`/api/getFormData?subMenuId=${subMenuId}`);
        const res = await fetch(`/api/getFormData?subMenuId=${subMenuId}`);//los datos del submenu { buttons, fields,formn} 
        if (!res.ok) {
          throw new Error(`Failed to fetch form data: ${res.statusText}`);
        }
        data= await res.json();
        

        if ( data.fields && data.fields.length ===1 && data.fields[0].type ==='grid'  ) {
          const spFetch=data.fields[0].spFetchRows || '';
          const [spName, params] = spFetch.split('(');// Extraemos el nombre del SP y los parámetros de la cadena spFetchOptions
          
          //console.log('spName, params',spName, params);
          if (!params || params.trim() === ')') { // Si no hay parámetros, simplemente ejecutamos el SP
            //console.log('No hay param');
            try{ //Aquí se leen los datos de la grilla
             const response = await fetch('/api/execSP', {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                 storedProcedure: spName,
                 parameters: {},
               }),
             });
             if (response.ok) {
               const rows = await response.json();
                console.log('en data grilla rows', rows);
                console.log('en [submenuId] data',data);
                if (data?.fields?.length) {
                  data.fields.forEach((field) => {
                    //console.log('field.rows',field.rows)
                    if (field.type === 'grid' && rows) {
                      // Manejar la inicialización de los valores dentro de la grilla
                      initialValues[field.name] = rows.map(row => {
                        const rowValues: { [key: string]: any } = {};
                        field.columns?.forEach((column) => {
                          rowValues[column.name] = row[column.name] !== undefined ? row[column.name] : '';
                        });
                        return rowValues;
                      });
                    } else {
                      // Manejar campos escalares normales
                      initialValues[field.name] = field.value !== undefined ? field.value : '';
                    }
                  });
                } else {
                  console.warn('No fields found in formData.');
                  console.log('formData:', formData);
                }
                console.log('initialValues',initialValues);
   
               //setGridRows(data)
              
             } else {
               console.error('Error al obtener las filas de la grilla');
             }
            
           }catch (error){
           
           }  
          }
      }
        setFormData( data );//Devuelve el campo jsonForm de la tabla Form
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();  
    setLoading(false); 
  }, [subMenuId]);
  
  /*
  useEffect(()=> {     
      const getInitialValuesDynamicForm = async (formData => {//: { fields?: FormFieldType[] }): { [key: string]: any }
        const initialValues: { [key: string]: any }   = {};
        const [ spFetchRows, setSpFetchRows ]         = useState<string>(''); 
        if ( formData.fields && formData.fields.length ===1 && formData.fields[0].type ==='grid'  ) {
          
          const sp=formData.fields[0].spFetchRows || '';
          console.log('formData sp',sp);
          setSpFetchRows(sp);
        }
        
        //const allValues:any[]=[];
       // return initialValues;
      //se requiere leer las filas de la grilla para armar los values
      const fetchRows = async (spFetch:string) => {//función que trae los datos
        try {        
          const [spName, params] = spFetch.split('(');// Extraemos el nombre del SP y los parámetros de la cadena spFetchOptions
          //console.log('spName, params',spName, params);
          if (!params || params.trim() === ')') { // Si no hay parámetros, simplemente ejecutamos el SP
            const response = await fetch('/api/execSP', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                storedProcedure: spName,
                parameters: {},
              }),
            });
            if (response.ok) {
              const data = await response.json();
              // console.log('en Mygrid data', data);
              setGridRows(data)
             
            } else {
              console.error('Error al obtener las opciones');
            }
          }
          } catch (err) {
            console.error('Error fetching options:', err);
          } 
            return ;
          }
    if (formData) fetchRows('')  
  },[formData])
  */
  
  if (subMenuId === 0) {
    return <div>No valid subMenuId provided</div>;
  }
  if (!formData || loading ) {
    return <LoadingIndicator  message='cargando' />;    
  }
  const handleClose=() =>{
    router.push('/');
  }
  const themeClass = formData.theme === 'dark' ? 'theme-dark' : 'theme-light';
  const theme=formData.theme === 'dark' ? 'dark' : 'light';
  const globalStyles = {
    backgroundColor: formData.theme === 'dark' ? '#2d3748' : '#f7fafc', // Fondo oscuro o claro
    color: formData.theme === 'dark' ? '#f7fafc' : '#1a202c',           // Texto claro u oscuro
    borderColor: formData.theme === 'dark' ? '#4a5568' : '#cbd5e0',     // Bordes
    padding: '20px', // Otros estilos que se apliquen de manera general     
  };
  const formSize = formData.formSize || {};

  // const initialValues = getInitialValuesDynamicForm(formData);
  const validationSchema = getValidationSchemaDynamicForm(formData);
  return (//Aquí va el despliegue de la grilla no editable con los datos de la tabla que se hace en FormRow

    <div
      className={`relative p-6 rounded-lg shadow-lg max-w-full mx-auto mt-8 ${themeClass}`}
      style={{
        ...globalStyles,
        ...formSize,
        maxWidth: formData.formSize?.maxWidth || '100%',
      }}
    >
      <h1 className="text-3xl font-bold mb-4">{formData.formTitle}</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          console.log('Submitted Values:', values);
        }}
      >
        {({ resetForm, dirty, values, setFieldValue }) => {
          // useEffect (()=>{
          //   {console.log('en useEffect formData',formData);}

          // },[formData])
          useEffect (()=>{
            {console.log('en useEffect en [submenuID] values',values);}

          },[values])
          return(
          <>       
            <GoHomeButton isFormModified={dirty} theme={theme} />
            <Form>
              {formData.frames ? (//si tiene frames
                formData.frames.map((frame, index) => {
                  //console.log('JSX frame',frame,index); 
                  return (
                    <FormRow key={frame.id} fields={frame.fields} theme={theme} width={formSize.width} allValues={values} // Pasamos values como allValues a FormRow
                    />
                  )
                })
              ) : (                
                formData.fields && (//sin frames
                  <FormRow fields={formData.fields} theme={theme} allValues={values}  maxWidth={formSize.maxWidth}  width={formSize.width} />
                )
              )}
              <div className="flex space-x-4 mt-4">
                {formData.buttons &&
                  formData.buttons.map((button, index) => {
                    //console.log('JSX en FormPage',button);
                    return (
                    <button
                      key={button.id}//supone que no se repite
                      type={button.action === 'submit' ? 'submit' : 'button'}
                      onClick={
                        button.action === 'reset'
                          ? () => resetForm()
                          : button.action === 'return'
                          ? () =>   handleClose()
                          :() => {
                              console.log('Form submitted with values:', values);
                            }
                      }
                      className={`px-4 py-2 rounded ${
                        button.action === 'submit'
                          ? 'bg-blue-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                      style={{
                        backgroundColor: button.backgroundColor,
                        color: button.color,
                        padding: button.padding,
                        borderRadius: button.borderRadius,
                        marginRight: button.marginRight || '0',
                      }}
                    >
                      {button.text}
                    </button>)
                  })}
              </div>
            </Form>
          </>
          )
        }}
      </Formik>
    </div>
  );
};
export default FormPage;