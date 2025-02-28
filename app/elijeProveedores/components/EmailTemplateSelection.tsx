import { Field } from "formik";
import { CustomSelect } from "@/components/controls";
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
  //console.log('EmailTemplateSelection',placeholders);
  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow">
      <div className="w-3/5">
        <Field
          as={CustomSelect}
          label="Plantilla del email a enviar (1ero defina proveedores a cotizar)"
          name='selectedTemplateId'
          options={emailOptions || []}
          enabled={values.proveedoresSelected?.length > 0}
          placeholder="Defina el formato del email a enviar al proveedor"
          width="80%"
          onChange={(e: any) => {
            const selectedId = Number(e);
            setFieldValue("selectedTemplateId", selectedId);
            const template = values.emailTemplate.find((t: any) => t.idEmailTemplate === selectedId);
            //setEditableBody(template ? template.bodyTemplate : "");
            setEditableBody(template ? replacePlaceholders(template.bodyTemplate, placeholders) : "");
            setFieldValue("selectedTemplate", template || null);
          }}
        />
      </div>
    </div>
  );
};
