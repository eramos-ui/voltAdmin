import React from 'react';
import { Formik, Form, Field } from 'formik';
import { FormRow } from '../controls';
import { getValidationSchema } from '../../utils/validationSchema';
import { FormConfig, FormValues  } from '../../../types/interfaces';

const EditFormFields: React.FC<{
  formConfig: FormConfig;
  initialValues: FormValues;
  onSubmit: (values: FormValues) => void;
  onClose: () => void;
  theme: 'light' | 'dark';
}> = ({ formConfig, initialValues, onSubmit, onClose, theme }) => {
  const validationSchema = getValidationSchema(formConfig);

  return (
    <>
    {/* {console.log('en render EditFormFields formConfig',formConfig)} */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          onSubmit(values);
          setSubmitting(false);
        }}
      >
        {({ values }) => (
          <Form>
            {formConfig.frames ? (
              formConfig.frames.map((frame, index) => (
                <FormRow
                  key={index}
                  fields={frame.fields}
                  theme={theme}
                  allValues={values}
                  maxWidth={formConfig.formSize?.maxWidth}
                />
              ))
            ) : (
              formConfig.fields && <FormRow key={formConfig.frames } fields={formConfig.fields} theme={theme} allValues={values} />
            )}

            <div className="flex justify-end mt-4 space-x-4">
              {/* <div className="flex space-x-4"> */}
                  <button type="button" onClick={onClose}  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                      Cancelar
                  </button>
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      Grabar
                  </button>
              {/* </div> */}
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default EditFormFields;
