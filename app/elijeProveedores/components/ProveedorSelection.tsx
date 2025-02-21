import { Field } from "formik";
import { CustomSelect, CustomInput } from "@/app/components/controls";

interface ProveedorSelectionProps {
  proveedoresOptions: any[];
  filesOptions: any[];
}

export const ProveedorSelection = ({ proveedoresOptions, filesOptions }: ProveedorSelectionProps) => {
  return (
    <div className="mb-1 flex items-start space-x-2">
      {proveedoresOptions.length > 0 && (
        <div className="w-3/8">
          <Field as={CustomSelect} multiple={true}
            label="Proveedores a cotizar"
            name='proveedoresSelected'
            options={proveedoresOptions || []}
            placeholder="Defina proveedores a cotizar"
            width="100%" required
          />
        </div>
      )}

      {filesOptions.length > 0 && (
        <div className="w-5/8">
          <Field as={CustomSelect} multiple={true}
            label="Anexos a adjuntar"
            name='anexosSelected'
            options={filesOptions || []}
            placeholder="Defina archivos a enviar al proveedor"
            width="100%"
          />
        </div>
      )}
    </div>
  );
};
