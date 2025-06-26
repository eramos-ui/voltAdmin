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
import { useEffect, useState } from 'react';
import { buildInitialValues } from '@/utils/buildInitialValuesForDynamicForm';

interface EditFormProps { // formulario dynamic
  formConfig: FormConfigDFType;
  fields: FormFieldDFType[];
  isOpen: boolean;
  onClose: () => void;
  row: FormValuesDFType;
  columns:GridColumnDFType[];
  isAdding?:boolean;
  apiSaveForm?:string;
  theme?:string;
  requirePassword?:boolean;
  formId:Number;
  globalStyles?: {
    light?: React.CSSProperties;
    dark?: React.CSSProperties;
  };
}
interface Option {
  value: string | number;
  label: string;
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
  apiSaveForm,
  requirePassword=false,  
  formId,
  ...props
}) => {
  const initialValues = buildInitialValues(fields, row);
  // console.log('en EditForm row',row,initialValues);
  const { theme: themeEdit, formSize, formTitle, modalStyles } = formConfig;
  const { data: session }                                      = useSession();
  // const [ alertMessage, setAlertMessage ]                      = useState<string | null>(null);
  // const [ alertDuration, setAlertDuration ]                    = useState<number | null>(null);
  // const [ alertType, setAlertType ]                            = useState<'success' | 'error' | 'info'>('info');
  // console.log('EditForm requirePassword',requirePassword);
  const theme: 'light' | 'dark' = themeEdit === 'dark' ? 'dark' : 'light';
  // const esNumero = (valor: string): boolean => { //establece si un string puede ser un numero
  //   if (valor.length === 0) return false;
  //   return !isNaN(Number(valor));
  // };
  const [loadedFields, setLoadedFields] = useState<FormFieldDFType[]>([]);
  useEffect(() => {
    const loadOptionsForSelects = async () => {
      const updatedFields = await Promise.all(
        fields.map(async (field) => {
          if ((field.type === 'select' || field.type ==='multiselect') && field.apiOptions) {
            try {
              const res = await fetch(`/api/${field.apiOptions}`);
              const data = await res.json(); 
              let options:Option[]=[];
              if (data && data.length>0){
                  options=data.map((option:any) =>{
                  return {
                    value: option.value,
                    label: option.label
                  };
                });
              }
              return {
                ...field,
                options: options || [], // Asegúrate que devuelva { options: [...] }
              };
            } catch (error) {
              console.error(`Error cargando options para ${field.name}:`, error);
              return { ...field, options: [] };
            }
          }
          return field;
        })
      );
      setLoadedFields(updatedFields);
    };
  
    loadOptionsForSelects();
  }, [fields]); // ⚠️ Solo depende de los fields originales

  //grabar
  const grabar = async( values:any) =>{
    console.log('en EditForm grabar',{...values});

  // const requirePassword=fields.find(field => field.type === 'password')?.requirePassword;
  const password = requirePassword ? await bcrypt.hash('password123', 10) : undefined;
  //console.log('grabar',fields,requirePassword,password);    return;
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
    // console.log('en EditForm grabar updateValues',updateValues);return;   
    const apiSaveForms=`/api/${apiSaveForm}`;
    const body={...updateValues, formId:formId,  idUserModification:session?.user.id};
    console.log('en EditForm grabar body',body);
    // const res = await fetch(`/api/${field.apiOptions}`);

     try {
      const response = await fetch(`${apiSaveForms}`, {
        method: 'POST',    
        body: JSON.stringify(body),
      });
      const result=await response.json();
      console.log('en EditForm grabar response',response.ok, result);
      if (response.ok) {
        alert("Grabado exitosamente");
    //     // setTimeout(handleClose, 3000);
    //     onClose();
      } else {
        if (response.status === 400) {
          alert(`${result.error}`);     
        }else{
          console.log('en FormPage grabar response',result.error);
          alert(`${result.error}, favor comuníquelo al administrador del sistema.`);    
        }
      }
    } catch (error) {
      alert(`${error}, favor comuníquelo al administrador del sistema.`);
    }
  };
  const groupedFields = loadedFields.reduce((acc, field, width) => {
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
    {/* {(() => { console.log('en jsx page ', loadedFields, groupedFields); return null; })()} */}
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        width={ formConfig.formSize?.width }
        title={isAdding ? `Agregar Información: ${formTitle}` : `Modificar Información: ${formTitle}`}
        position={'center'}
       >
        <Formik
         initialValues={row}
         validateOnBlur={true} //ejecuta la validación Yup cuando el usuario sale del campo
         validationSchema={validationSchema}//validations es el schema de valicaicón Yup para el formulario dinámico
         onSubmit={async (values, { setSubmitting, validateForm }) => {
          const errors=await validateForm(values); // 🔹 Valida antes de ejecutar submit
          if (Object.keys(errors).length === 0) {
            const _id=initialValues._id;
            await grabar({...values,_id});
          }
          setSubmitting(false);//previene el doble clic en el botón de submit 
         }}  
            >
        {({ errors={}, touched={},values, setFieldValue, isSubmitting, isValid  }) => {// console.log("Formik errors,touched,isValid:", errors,touched,isValid);
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
                      // console.log('en EditForm field',field);
                      const fullField = loadedFields.find(f => f.name === field.name) || field;
                    return ( 
                      <div  key={`${item}-${field.name}`} className={`px-2`}  >
                        <FieldComponentDF field={fullField} errors={errors} touched={touched} values={values} setFieldValue={setFieldValue} theme={theme}/>
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
                    size='small' icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} htmlType='submit'
                    tooltipContent='Salvar los cambios y volver a la página anterior' tooltipPosition='left' style={{ marginLeft:5 }} 
                    // onClick={() => grabar(values)} disabled={isSubmitting} 
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