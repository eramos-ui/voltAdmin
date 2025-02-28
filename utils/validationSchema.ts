import * as Yup from 'yup';
import { parse, isDate } from 'date-fns';
import { FormFieldType, FrameConfig } from '@/types/interfaces';

const buildValidationSchema = (fields: FormFieldType[]): { [key: string]: Yup.MixedSchema } => {
  const schemaFields: { [key: string]: Yup.MixedSchema } = {};

  fields.forEach((field) => {
    if (!field.validations) return;

    let schema: Yup.MixedSchema = Yup.mixed(); // Schema base

    field.validations.forEach((rule) => {
      switch (rule.type) {
        case 'required':
          schema = schema.required('Este campo es requerido');
          break;
        case 'minLength':
          if (typeof rule.value === 'number') {
           //schema = (schema as Yup.StringSchema).min(rule.value, `Mínimo de ${rule.value} caracteres`);
           schema = (Yup.string().min(rule.value, `Mínimo de ${rule.value} caracteres`) as unknown) as Yup.MixedSchema;
          }
          break;
        case 'email':
          //schema = (schema as Yup.StringSchema).email('El correo no tiene un formato válido');
          schema = (Yup.string().email('El correo no tiene un formato válido') as unknown) as Yup.MixedSchema;
          break;
        case 'minDate':
          if (typeof rule.value === 'string') {
            //schema = (schema as Yup.DateSchema).min(new Date(rule.value), rule.message || `La fecha debe ser después de ${rule.value}`);
            schema = (Yup.date()
            .transform((value, originalValue) => {
              if (typeof originalValue === 'string') {
                const parsedDate = parse(originalValue, 'dd/MM/yyyy', new Date());
                if (isDate(parsedDate) && !isNaN(parsedDate.getTime())) {
                  return parsedDate;
                }
              }
              return value;
            })
            .min(new Date(rule.value), rule.message || `La fecha debe ser después de ${rule.value}`) as unknown) as Yup.MixedSchema;
          }
          break;
        case 'maxDate':
          if (typeof rule.value === 'string') {
            //schema = (schema as Yup.DateSchema).max(new Date(rule.value), rule.message || `La fecha debe ser antes de ${rule.value}`);
            schema = (Yup.date()
            .transform((value, originalValue) => {
              if (typeof originalValue === 'string') {
                const parsedDate = parse(originalValue, 'dd/MM/yyyy', new Date());
                if (isDate(parsedDate) && !isNaN(parsedDate.getTime())) {
                  return parsedDate;
                }
              }
              return value;
            })
            .max(new Date(rule.value), rule.message || `La fecha debe ser antes de ${rule.value}`) as unknown) as Yup.MixedSchema;
           }          
          break;
      }
    });
    if (field.type === 'date') {
      schema = schema.transform((value, originalValue) => {
        if (typeof originalValue === 'string') {
          const parsedDate = parse(originalValue, 'dd/MM/yyyy', new Date());
          if (isDate(parsedDate) && !isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
        return value;
      });
    }

    schemaFields[field.name] = schema;
  });

  return schemaFields;
};

export const getValidationSchemaDynamicForm = (
  formData: { frames?: FrameConfig[]; fields?: FormFieldType[] }
): Yup.ObjectSchema<{ [key: string]: any }> => {
  let schemaFields: { [key: string]: Yup.MixedSchema } = {};
  if (formData.frames) {
    formData.frames.forEach((frame) => {
      const frameSchema = buildValidationSchema(frame.fields);
      schemaFields = { ...schemaFields, ...frameSchema };
    });
  } else if (formData.fields) {
    //console.log('formData.fields',formData.fields) 
    schemaFields = buildValidationSchema(formData.fields);
  }

  return Yup.object().shape(schemaFields);
};




// import * as Yup from 'yup';
// import { FormField, DynamicFormValues } from '../../types/interfaces';
// import { parse, isDate } from 'date-fns';

// export const getValidationSchema = (frames: { fields: FormField[] }[]): Yup.ObjectSchema<DynamicFormValues> => {
//   const requiredFields: { [key: string]: Yup.MixedSchema } = {};

//   frames.forEach(frame => {
//     frame.fields.forEach(input => {
//       if (!input.validations) return;
//       let schema: Yup.MixedSchema = Yup.mixed();

//       input.validations.forEach(rule => {
//         if (rule.type === 'required') {
//           schema = schema.required('Este campo es requerido');
//         }
//         if (rule.type === 'minLength' && typeof rule.value === 'number') {
//           schema = (Yup.string().min(rule.value, `Mínimo de ${rule.value} caracteres`) as unknown) as Yup.MixedSchema;
//         }
//         if (rule.type === 'email') {
//           schema = (Yup.string().email('El correo no tiene un formato válido') as unknown) as Yup.MixedSchema;
//         }
//         if (rule.type === 'minDate' && typeof rule.value === 'string') {
//           schema = (Yup.date()
//             .transform((value, originalValue) => {
//               if (typeof originalValue === 'string') {
//                 const parsedDate = parse(originalValue, 'dd/MM/yyyy', new Date());
//                 if (isDate(parsedDate) && !isNaN(parsedDate.getTime())) {
//                   return parsedDate;
//                 }
//               }
//               return value;
//             })
//             .min(new Date(rule.value), rule.message || `La fecha debe ser después de ${rule.value}`) as unknown) as Yup.MixedSchema;
//         }
//         if (rule.type === 'maxDate' && typeof rule.value === 'string') {
//           schema = (Yup.date()
//             .transform((value, originalValue) => {
//               if (typeof originalValue === 'string') {
//                 const parsedDate = parse(originalValue, 'dd/MM/yyyy', new Date());
//                 if (isDate(parsedDate) && !isNaN(parsedDate.getTime())) {
//                   return parsedDate;
//                 }
//               }
//               return value;
//             })
//             .max(new Date(rule.value), rule.message || `La fecha debe ser antes de ${rule.value}`) as unknown) as Yup.MixedSchema;
//         }
//       });
//       if (input.type === 'date') {
//         schema = schema.transform((value, originalValue) => {
//           if (typeof originalValue === 'string') {
//             const parsedDate = parse(originalValue, 'dd/MM/yyyy', new Date());
//             if (isDate(parsedDate) && !isNaN(parsedDate.getTime())) {
//               return parsedDate;
//             }
//           }
//           return value;
//         });
//       }

//       requiredFields[input.name] = schema;
//     });
//   });

//   return Yup.object().shape(requiredFields) as Yup.ObjectSchema<DynamicFormValues>;
// };
