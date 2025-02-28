"use client";
import React, { useEffect, useState } from 'react';
// import Modal from 'react-modal';
import { useSession } from 'next-auth/react';
//import { Field, Form, Formik, FormikHelpers } from 'formik';
import bcrypt from 'bcryptjs';
import { EditFormProps, FormConfigType, FormValues, } from '@/types/interfaces';
import EditFormFields from './EditFormFields';

import { CustomAlert, FormRow } from '../controls';
import { saveFormData } from '@/utils/apiHelpers';
import { formatRut } from '@/utils/formatRut';
import CustomModal from '../general/CustomModal';
// import { getValidationSchema } from '../../utils/validationSchema';
import { getValidationSchemaDynamicForm } from '@/utils/validationSchema';


export const EditForm: React.FC<EditFormProps> = ({
  formConfig,
  isOpen,
  onClose,
  initialValues,
  isAdding,
  spFetchSaveGrid,
  requirePassword,
  ...props
}) => {
  const { theme: themeEdit, formSize, formTitle, modalStyles } = formConfig;
  const { data: session }                                      = useSession();
  const [ formData, setFormData ]                              = useState<FormConfigType | null>(formConfig);
  const [ values, setValues ]                                  = useState<any[]>();
  const [ alertMessage, setAlertMessage ]                      = useState<string | null>(null);
  const [ alertDuration, setAlertDuration ]                    = useState<number | null>(null);
  const [ alertType, setAlertType ]                            = useState<'success' | 'error' | 'info'>('info');

  const theme: 'light' | 'dark' = themeEdit === 'dark' ? 'dark' : 'light';
  //console.log('formSize',formSize,modalStyles);

  // if ( !formConfig) {
  //   console.error("editFormConfig is missing from formConfig");
  //   return null; // o puedes renderizar algún mensaje de error o un componente alternativo
  // } 
  const showAlert = (message: string, type: 'success' | 'error' | 'info', duration: number | null) => {// Función para configurar la alerta
    setAlertMessage(message);
    setAlertType(type);
    setAlertDuration(duration);
  };
  const handleSubmit = async (values: FormValues) => {
    try {
      const password = requirePassword ? await bcrypt.hash('password123', 10) : undefined;
      const response = await saveFormData(
        spFetchSaveGrid!,
        { ...values, idUserModification: session?.user.id, password },
        formatRut,
      );
      
      if (response.success) {
        showAlert("Grabado exitosamente", "success", 3000);
        setTimeout(onClose, 3000);
      } else {
        showAlert(`Error al guardar los datos: ${response.error}`, "error", null);
      }
    } catch (error) {
      showAlert(`Error al guardar los datos: ${error}`, "error", null);
    }
  };
  if (!isOpen) return null;  
  //console.log('EditForm formConfig',formConfig);  
  useEffect(()=>{
      if (formConfig.fields) 
        {
          setValues ( formConfig.fields?.reduce((acc: any, field: any) => {
            acc[field.name] = initialValues[field.name] !== undefined ? initialValues[field.name] : field.value || '';
            return acc;
          }, {} as FormValues));
        } 
  },[formConfig.fields])
  // const initialFormValues = formConfig.fields?.reduce((acc: any, field: any) => {
  //   acc[field.name] = initialValues[field.name] !== undefined ? initialValues[field.name] : field.value || '';
  //   return acc;
  // }, {} as FormValues);
  // const validationSchema = getValidationSchemaDynamicForm(formConfig);
  // const modalTitle = isAdding 
  // ? 'Add Information ' + formTitle 
  // : formConfig && formTitle 
  //   ? 'Edit Information '  + formTitle
  //   :  formTitle;
  
  if (!formData) <></>; 
  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        width={ formConfig.formSize?.width }
        title={isAdding ? `Agregar Información: ${formTitle}` : `Modificar Información: ${formTitle}`}
        position={'center'}
       >
        <div> 
            <EditFormFields
              formConfig={formConfig}
              values={initialValues}
              setValues={setValues}
              onSubmit={handleSubmit}
              onClose={ onClose }
              theme={theme}
              />
            </div>
      </CustomModal>
    </>
  );
};
