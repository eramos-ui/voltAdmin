import { Field } from "formik";
import { CustomSelect, SelectFormikSingle, SelectStandaloneSingle } from "@/components/controls";
import { replacePlaceholders } from "@/utils/replacePlaceholders";

interface EmailTemplateSelectionProps {
  emailOptions: any[];
  values: any;
  setFieldValue: (field: string, value: any) => void;
  setEditableBody: (value: string) => void;
  placeholders: Record<string, string>;
}

export const EmailTemplateSelection = ({
  emailOptions,
  values,
  setFieldValue,
  setEditableBody,
  placeholders
}: EmailTemplateSelectionProps) => {
   //console.log('EmailTemplateSelection emailOptions,emailTemplate',emailOptions.length,values.emailTemplate.length);
   const handleChange=(e:any)=>{//Aquí habilita la Edición de valores de la plantilla (template)
    const selectedId = Number(e);
    setFieldValue("handleChange selectedTemplateId", selectedId);
    const template = values.emailTemplate.find((t: any) => t.idEmailTemplate === selectedId);
    setEditableBody(template ? replacePlaceholders(template.bodyTemplate, placeholders) : "");
    setFieldValue("selectedTemplate", template || null);
   }
   /*sin usar Formik (muchos problemas) */
  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow">
      <div className="w-3/5">
        <SelectStandaloneSingle
          // as={CustomSelect}
          label="Plantilla del email a enviar (1ero defina proveedores a cotizar)"
          name='selectedTemplateId'
          options={emailOptions || []}
          enabled={values.proveedoresSelected?.length > 0}
          placeholder="Defina el formato del email a enviar al proveedor"
          width="80%"
          onValueChange={(e: any) => {handleChange(e)
            // const selectedId = Number(e);
            // console.log('EmailTemplateSelection selectedId',selectedId)
            // setFieldValue("selectedTemplateId", selectedId);
            // const template = values.emailTemplate.find((t: any) => t.idEmailTemplate === selectedId);
            // //setEditableBody(template ? template.bodyTemplate : "");
            // setEditableBody(template ? replacePlaceholders(template.bodyTemplate, placeholders) : "");
            // setFieldValue("selectedTemplate", template || null);
          }}
        />
      </div>
    </div>
  );
};
