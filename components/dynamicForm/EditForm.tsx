"use client";
//import React, { useEffect, useState } from 'react';
// import Modal from 'react-modal';
import { useSession } from 'next-auth/react';
// import { useFormikContext } from 'formik';
import {  Form, Formik} from 'formik';
import * as Yup from "yup";
import bcrypt from 'bcryptjs';
import _ from 'lodash';
//import { EditFormProps, FormConfigType, FormValues, } from '@/types/interfaces';

import {  FormConfigDFType, FormFieldDFType, FormValuesDFType, GridColumnDFType, GridRowDFType } from '@/types/interfaceDF';

// import { CustomAlert, FormRow } from '../controls';
import { saveFormData } from '@/utils/apiHelpers';
import { formatRut } from '@/utils/formatRut';
import CustomModal from '../general/CustomModal';
import { getValidationSchemaDynamicForm } from '@/utils/validationSchema';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { CustomButton } from '../controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { FieldComponentDF } from '../dynamicForm/FieldComponentDF';

interface EditFormProps { // formulario dynamic
  formConfig: FormConfigDFType;
  fields: FormFieldDFType[];
  isOpen: boolean;
  onClose: () => void;
  row: FormValuesDFType;
  columns:GridColumnDFType[];
  isAdding?:boolean;
  spFetchSaveGrid?:string;
  theme?:string;
  requirePassword?:boolean;
  globalStyles?: {
    light?: React.CSSProperties;
    dark?: React.CSSProperties;
  };
}
// const typeValues= ['number','string','rut','sin','boolean','money'];
//form para editar los datos de la grilla de la tabla que administra el Dynamic Form
export const EditForm: React.FC<EditFormProps> = ({
  formConfig,
  fields,
  isOpen,
  onClose,
  row,
  columns,
  isAdding,
  spFetchSaveGrid,
  requirePassword,
  ...props
}) => {
  const { theme: themeEdit, formSize, formTitle, modalStyles } = formConfig;
  const { data: session }                                      = useSession();
  // const [ alertMessage, setAlertMessage ]                      = useState<string | null>(null);
  // const [ alertDuration, setAlertDuration ]                    = useState<number | null>(null);
  // const [ alertType, setAlertType ]                            = useState<'success' | 'error' | 'info'>('info');
  const theme: 'light' | 'dark' = themeEdit === 'dark' ? 'dark' : 'light';
  const esNumero = (valor: string): boolean => { //establece si un string puede ser un numero
    if (valor.length === 0) return false;
    return !isNaN(Number(valor));
  };
  //grabar
  const grabar = async( values:any) =>{
    const requirePassword=fields.find(field => field.type === 'password')?.requirePassword;
    const password = requirePassword ? await bcrypt.hash('password123', 10) : undefined;
    const withRutFields=fields.filter(field => field.type === 'RUT');//field que tienen field type='RUT' para formatearlo estándar
    let updateValues:any=values;
    if (withRutFields && withRutFields.length > 0) {
        //actualizar rut de los values[field.name] cuando es un rut para que se graben ###.###.###-# , se hace 2 veces porque formatRut lo repite
      withRutFields.forEach((field:any) => {
        const valueRut=values[field.name];
        updateValues[field.name]=valueRut;
      });
    }    
    const changedItem=_.isEqual(updateValues,row); //compara si los valores de updateValues son iguales a los de row
    if (changedItem) {
      console.log('en FormPage grabar no hay cambios');
      return;
    } 
    try {
      const response = await saveFormData(
        spFetchSaveGrid!,
        { ...updateValues, idUserModification: session?.user.id, password },
        formatRut,
      );
      if (response.success) {
        alert("Grabado exitosamente");
        // setTimeout(handleClose, 3000);
        onClose();
      } else {
        console.log('en FormPage grabar response',response.error);
        alert(`${response.error.error}, favor comuníquelo al administrador del sistema.`);        
      }
    } catch (error) {
      alert(`${error}, favor comuníquelo al administrador del sistema.`);
    }
  };
  const groupedFields = fields.reduce((acc, field, width) => {
    if (!acc[field.row]) {
      acc[field.row] = [];
    }
    acc[field.row].push(field);
    return acc;
  }, {} as { [key: number]: FormFieldDFType[] });
  if (!isOpen) return null;  
  if (!row) <></>; 
  const validationSchema = getValidationSchemaDynamicForm(fields);
  return (
    <>
    {/* {(() => { console.log('en jsx page ', getValidationSchemaDynamicForm(fields)); return null; })()} */}
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        width={ formConfig.formSize?.width }
        title={isAdding ? `Agregar Información: ${formTitle}` : `Modificar Información: ${formTitle}`}
        position={'center'}
       >
        <Formik
         initialValues={row}
         validateOnBlur={true} //validateOnChange={true} 
         validationSchema={validationSchema}//{getValidationSchemaDynamicForm(fields)}  
         onSubmit={async (values, { setSubmitting, validateForm }) => {
          const errors=await validateForm(values); // 🔹 Valida antes de ejecutar submit
          if (Object.keys(errors).length === 0) {
            console.log("🚀 Enviando datos... a grabar", values);
            await grabar(values);
          }
          setSubmitting(false);//previene el doble clic en el botón de submit 
         }}
        >
        {({ errors={}, touched={},values, setFieldValue,isSubmitting,isValid  }) => {// console.log("Formik errors,touched,isValid:", errors,touched,isValid);
          //  useEffect(()=>{ console.log('en EditForm useEffect',values);},[values])
          if (isSubmitting) return <div>Guardando...</div>;
        return (
          <Form>
            <div> 
              { Object.keys(groupedFields).map( item => {
                if (!item) return null;
                return (
                  <div className={`flex flex-wrap -mx-2 mb-4 w-[100%]`} key={ item }           
                  >
                    {groupedFields[Number(item)].map(field => {
                    return ( 
                      <div  key={`${item}-${field.name}`} className={`px-2`}  >
                        <FieldComponentDF errors={errors} touched={touched} field={field} theme={theme} values={values} setFieldValue={setFieldValue}/>
                      </div> 
                      )
                    })}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-4 space-x-4 mr-10">
                <CustomButton label='Cancelar y salir' onClick={onClose} buttonStyle='secondary'
                    size='small'  icon={<FontAwesomeIcon icon={faSignOutAlt} size="lg" color="white" />}
                    tooltipContent='Abandonar la página sin salvar los cambios' tooltipPosition='left' 
                  />
                  <CustomButton label= {isSubmitting ? "Enviando..." : "Salvar cambios"}  buttonStyle='primary'
                    size='small' icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />}
                    tooltipContent='Salvar los cambios y volver a la página anterior' tooltipPosition='left' style={{ marginLeft:5 }} 
                    htmlType='submit' disabled={isSubmitting}  //onClick={() => updateTable(values)}
                  />
              </div>   
          </Form>
        )
        }}
        </Formik>
      </CustomModal>
    </>
  );
};