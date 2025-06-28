import * as Yup from 'yup';
import { parse, isDate } from 'date-fns';
import { FormFieldDFType } from '@/types/interfaceDF';
import { validateRut } from '@/utils/validateRut';



// 🔹 Función para generar validaciones dinámicas con Yup
export const getValidationSchemaDynamicForm = (fields: FormFieldDFType[]) => {
  const schema: Record<string, Yup.AnySchema> = {};
  // console.log('getValidationSchemaDynamicForm',fields);
  fields.forEach((field, index) => {

    let fieldSchema : Yup.AnySchema = Yup.mixed();
    // Base schema según tipo
    switch (field.type) {
      case 'text':
      case 'email':
      case 'RUT':
      case 'input':
      case 'textarea':
        fieldSchema = Yup.string();
        break;
      case 'number':
        fieldSchema  = Yup.number();
        break;
      case 'date':
        fieldSchema  = Yup.date();
        break;
      case 'select': 
      // console.log('select field',field,field.options,field.spFetchOptions);
      // 📌 Validar selects con opciones estáticas
        fieldSchema = Yup.string()
        .required("Debe seleccionar una opción") // 📌 Asegura que no sea vacío o null
        //.nullable()
        .test("validate-select", "Debe seleccionar una opción válida", (value) => {//.test("nombreDelTest", "mensajeDeError", (value) => {funciónDeValidación}) //true es válido
          // console.log('validate-select',field.options,field.apiOptions);
          // Si tiene opciones predefinidas, validar que esté en ellas
          if (field.options && field.options.length > 0) {
            return field.options.some(opt => String(opt.value) === String(value));
          }
          // Si es dinámico, no validar hasta que tenga opciones cargadas
          if (field.apiOptions && field.apiOptions.length > 0) return true;
          return false;
        });
     
        // 📌 Validar que el valor sea mayor que 0 si la regla está definida
        if (field.validations?.some(v => v.type === "valueGreaterThanZero")) {
          fieldSchema = fieldSchema.test(
            "value-greater-than-zero",
            "El valor debe ser mayor que 0",
            (value) => Number(value) > 0
          );
        }
        break;
    }
    // Validación especial para RUT
    if (field.type === "RUT") {
      fieldSchema = Yup.string()
        .required("El RUT es obligatorio")
        .test(
          "rut-format",
          "Formato incorrecto de RUT",
          (value) => {
            if (!value) return false;
            return validateRut(value); // 👈 tu función booleana
          }
        )
    }
    field.validations?.forEach((rule) => {    // 🔹 Agregar validaciones según el esquema definido en la BD-json
      switch (rule.type) {
        case "required":
          fieldSchema  = fieldSchema .required(rule.message || "Este campo es obligatorio");
          break;
        case "maxLength":
          fieldSchema  = (fieldSchema  as Yup.StringSchema).max(Number(rule.value!), rule.message || `Máximo ${rule.value} caracteres`);
          break;
        case "minLength":
          fieldSchema  = (fieldSchema  as Yup.StringSchema).min(Number(rule.value!), rule.message || `Mínimo ${rule.value} caracteres`);
          break;
        case "email":
          fieldSchema  = (fieldSchema  as Yup.StringSchema).email(rule.message || "Debe ser un correo válido");
          break;
        // case "pattern":
        //   const regex = new RegExp(rule.value as string); // 📌 Convierte el string en RegExp
        //   fieldSchema  = (fieldSchema  as Yup.StringSchema).matches(regex, rule.message || "Formato inválido");
        //   // if (field.type === "RUT") console.log('RUT field',rule,regex,fieldSchema);
        //   break;
        case "url":
          fieldSchema  = (fieldSchema  as Yup.StringSchema).url(rule.message || "Debe ser una URL válida");
          break;
        case "min":
          fieldSchema  = (fieldSchema  as Yup.NumberSchema).min(Number(rule.value!), rule.message || `Mínimo valor permitido: ${rule.value}`);
          break;
        case "max":
          fieldSchema  = (fieldSchema  as Yup.NumberSchema).max(Number(rule.value!), rule.message || `Máximo valor permitido: ${rule.value}`);
          break;
          
      }
    });
      // Validación condicional: requiredIf
    // if (field.requiredIf?.field && field.requiredIf?.equal !== undefined) {
    if (field.requiredIf && typeof field.requiredIf?.field === 'string' 
        &&  ["string", "number", "boolean"].includes(typeof field.requiredIf.equal) 
      ) {
       const { field: dependsOn, equal } = field.requiredIf;
       fieldSchema = Yup.string().when(dependsOn, {
       is: (val: any) => val === equal,
       then: schema => schema.required(`${field.label} es obligatorio cuando ${dependsOn} es ${equal}`),
       otherwise: schema => schema.notRequired(),
      });
    }
    schema[field.name] = fieldSchema;
  });
  //console.log('schema',schema);
  return Yup.object().shape(schema);
};


const buildValidationSchema = (fields: FormFieldDFType[]): { [key: string]: Yup.MixedSchema } => {
  const schemaFields: { [key: string]: Yup.MixedSchema } = {};

  fields.forEach((field) => {
    if (!field.validations) return;
    let schema: Yup.MixedSchema = Yup.mixed(); 

    field.validations.forEach((rule) => {
      console.log('rule',field.name,rule.type);
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
          console.log('en validationSchema email',field.name,rule);
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

