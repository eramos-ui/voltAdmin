"use client";
import { useEffect, useState } from 'react';
import GoHomeButton from '../components/GoHomeButton';
import { useRouter } from 'next/navigation';

import { Formik, Form } from 'formik'; 
import { getInitialValues } from '../utils/initialValues';

import { FormConfig } from '@/types/interfaces';
import { FormRow } from '../components/formComponents/FormRow';
import { getValidationSchema } from '../utils/validationSchema';
import { LoadingIndicator } from '../components/LoadingIndicator';

const FormPage = ({ params }: { params: { subMenuId: string } }) => {//Renderiza cualquier form en la BD-Form
  const [ formData, setFormData ] = useState<FormConfig | null>(null);//los campos del formulario
  const [ loading, setLoading ]   = useState(true);
  const [ error, setError ]       = useState<string | null>(null);
  const router                    = useRouter();
  const subMenuId = params?.subMenuId ? parseInt(params.subMenuId, 10) : 0;
  console.log('FormPage', params);
  useEffect(() => {
    async function fetchData() {
      if (subMenuId === 0) {
        setError('No valid subMenuId provided');
        setLoading(false);
        return;
      }  
      try {
        //console.log('lee menú',`/api/getFormData?subMenuId=${subMenuId}`);
        const res = await fetch(`/api/getFormData?subMenuId=${subMenuId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch form data: ${res.statusText}`);
        }
        const data: FormConfig = await res.json();        
        //console.log('data',data);
        setFormData(data);
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
  }, [subMenuId]);
  if (subMenuId === null) { 
    return <div>No subMenuId provided</div>;
  }
  if (subMenuId === 0) {
    return <div>No valid subMenuId provided</div>;
  }
  if (!formData || loading) {
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
  const initialValues = getInitialValues(formData);
  const validationSchema = getValidationSchema(formData);

  return (
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
        {({ resetForm, dirty, values }) => {
            //  {console.log('en JSX FormPage formData',formData);}
          return(
          <>       
            <GoHomeButton isFormModified={dirty} theme={theme} />
            <Form>
              {formData.frames ? (//si tiene frames
                formData.frames.map((frame, index) => {
                  //console.log('JSX frame',frame,index); 
                  return (
                    <FormRow
                      key={frame.id}
                      fields={frame.fields}
                      theme={theme}
                      allValues={values} // Pasamos values como allValues a FormRow
                      //maxWidth={formSize.maxWidth}
                      width={formSize.width}
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