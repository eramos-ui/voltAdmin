import React from 'react';
//import { Formik, Form, Field } from 'formik';
import { FormRow } from './FormRow';
// import { getValidationSchemaDynamicForm } from '@/utils/validationSchema';
import { FormConfigType, FormValues } from '@/types/interfaces';
import { CustomButton } from '../controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk,  faSignOutAlt } from '@fortawesome/free-solid-svg-icons';


const EditFormFields: React.FC<{
  formConfig: FormConfigType;
  values: FormValues;
  setValues: (values:any[]) => void;
  onSubmit: (values: FormValues) => void;
  onClose: () => void;
  theme: 'light' | 'dark';

}> = ({ formConfig, values,setValues, onSubmit, onClose, theme }) => {
  //const validationSchema = getValidationSchemaDynamicForm(formConfig);
  console.log('en EditFormField',formConfig.fields);
  // const fieldsFull={...formConfig.fields,value: }
  return (
    <>
      {formConfig.frames ? (
          formConfig.frames.map((frame, index) => (
            <FormRow
              key={index}
              fields={frame.fields}
              theme={theme}
              allValues={values}// es un object
              maxWidth={formConfig.formSize?.maxWidth}
            />
          ))
      ) : (
         formConfig.fields &&       
          <FormRow key={String('frame')} fields={formConfig.fields} theme={theme} allValues={values} />
      )}
      <div className="flex justify-end mt-4 space-x-4 mr-10">
         <CustomButton label='Cancelar y salir' onClick={onClose} buttonStyle='secondary'
             size='small'  icon={<FontAwesomeIcon icon={faSignOutAlt} size="lg" color="white" />}
             tooltipContent='Abandonar la página si salvar los cambios' tooltipPosition='left' 
          />
          <CustomButton label='Salvar cambios' onClick={onClose} buttonStyle='primary'
             size='small' icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />}
             tooltipContent='Salvar los cambios y volver a página anterios' tooltipPosition='left' 
             htmlType='submit' style={{ marginLeft:5 }} 
          />
          {/* <button type="button" onClick={onClose}  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancelar y salir
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Salvar
          </button>     */}
      </div>      
  </>
  )
};

export default EditFormFields;
