import { Field, FormikHelpers, useFormikContext } from "formik";
import { CustomLabel, SelectFormikMulti } from "@/components/controls";
import { useEffect } from "react";

interface ProveedorSelectionProps {
  proveedoresOptions: any[];
  filesOptions: any[];
  //  setFieldValue: FormikHelpers<any>["setFieldValue"];
}

export const ProveedorSelection = ({ proveedoresOptions, filesOptions }: ProveedorSelectionProps) => {//, setFieldValue
  //console.log('en ProveedorSelection filesOptions',filesOptions);
  //  console.log('en ProveedorSelection proveedoresOptions',proveedoresOptions);
  
  // const { values } = useFormikContext<any>();  //esto es para verficar los cambios en los campos
  // useEffect(() => {
  //   console.log("proveedoresSelected:", values.proveedoresSelected); // Array de IDs
  //   console.log("anexosSelected:", values.anexosSelected); // Array de IDs
  // }, [values.proveedoresSelected, values.anexosSelected]);
  return (
    <div className="mb-1 flex items-start space-x-2">
      {proveedoresOptions.length > 0 && (
        <div className="w-4/8">
          <Field as={SelectFormikMulti}
            label="Proveedores a cotizar"
            name='proveedoresSelected'//esto induce a Formik a actualizar el campo proveedoresSelected
            options={proveedoresOptions || []}
            placeholder="Defina proveedores a cotizar"
            width="100%" required
          />
          <div className="mt-0" >
           <CustomLabel size='normal' label='(COT) indica que ya se le cotizó' />
          </div>
        </div>
      )}
      {filesOptions.length > 0 && (
        <div className="w-4/8">
          <Field as={SelectFormikMulti} multiple={true}
            label="Anexos a adjuntar"
            name='anexosSelected'//esto induce a Formik a actualizar el campo anexosSelected
            options={filesOptions || []}
            placeholder="Defina archivos a enviar al proveedor"
            width="100%" 
          />
        </div>
      )}
    </div>
  );
};
