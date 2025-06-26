//para construir los valores iniciales del formulario dinámico cuando se trata de un nuevo registro
import { FormFieldDFType } from "@/types/interfaceDF";

export const buildInitialValues = (
  fields: FormFieldDFType[],
  row: Record<string, any> = {}
): Record<string, any> => {
  const initial: Record<string, any> = {};
  initial['_id']=undefined;
  
  fields.forEach(field => {
    const fieldName = field.name;

    // Usa el valor de `row` si existe (modo edición)
    if (row.hasOwnProperty(fieldName)) {
      initial[fieldName] = row[fieldName];
    } else {
      // Si no, define un valor por defecto según tipo
      switch (field.type) {
        case "number":
          initial[fieldName] = 0;
          break;
        case "select":
        case "text":
        case "email":
        case "RUT":
        case "input":
        case "textarea":
          initial[fieldName] = "";
          break;
        case "date":
          initial[fieldName] = null;
          break;
        // case "checkbox":
        //   initial[fieldName] = false;
        //   break;
        default:
          initial[fieldName] = "";
      }
    }
  });

  return initial;
};
