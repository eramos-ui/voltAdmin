import { useEffect, useState } from "react";
import { Field } from "formik";
import { CustomSelect } from "@/components/controls/CustomSelect";
import { Comunas, OptionsSelect } from "@/types/interfaces";
import { CustomInput } from "../controls";


interface LocationFormProps {
  regiones: OptionsSelect[];
  comunas: Comunas[] | undefined ;
  errors: any;
  touched: any;
}

export const LocationForm: React.FC<LocationFormProps> = ({ regiones, comunas, errors, touched }) => {
const [ regionSelected, setRegionSelected ] =useState<string>('');
const [ comunasPorRegion, setComunasPorRegion ] = useState<OptionsSelect[]>(); 
//console.log('comunas en LocationForm',comunas);
// const handleRegionChange = (value: string | number | null, setFieldValue: (field: string, value: any) => void) => {
//     console.log('handleRegionChange');
//     if (typeof value === "string") {
//       setRegionSelected(value); // Actualiza el estado
//     } else {
//       console.error("Invalid region value:", value); // Manejo de errores
//     }
//   };
useEffect(() => {
  if (regionSelected) {
    const regionData = comunas?.filter((comuna) => comuna.idRegion.toString() === regionSelected);
    const nuevasComunas = regionData
      ? regionData.map((comuna) => ({ value: comuna.idComuna.toString(), label: comuna.label }))
      : [];
    setComunasPorRegion(nuevasComunas);
  }
}, [regionSelected, comunas]); // Ejecuta cuando cambia `regionSelected` o `comunas`

return (
    <div className="mb-1 flex items-start space-x-2">
       <div className="w-3/8">
        <Field name="region">
          {({ field, form }: any) => {
            // useEffect(() => {
            //     if (field.value){
            //         const regionId = field.value.toString();
            //         const regionData = comunas?.filter( comuna => comuna.idRegion.toString() === regionId);
            //         const nuevasComunas= regionData
            //         ? regionData.map((comuna) => ({ value: comuna.idComuna.toString(), label: comuna.label }))
            //         : [];  
            //         setComunasPorRegion(nuevasComunas);
            //     }
            //     }, [field.value]); // Ejecuta cuando hay cambios en los valores
            return (
            <CustomSelect
            name='region'
                label="Región"
                options={regiones}
                placeholder="Seleccione una región"
                required
                multiple={false}
                theme="light"
                captionPosition="top"
                style={{ marginBottom: "1rem" }}
                width="100%"
                error={touched.region && errors.region ? errors.region : undefined}
                {...field}
                onChange={(value) => {
                  const regionValue = Array.isArray(value) ? value[0] : value; // 🔹 Tomamos el primer valor si es un array
                  form.setFieldValue("region", regionValue);
                  setRegionSelected(regionValue || ""); // ✅ Asegura que siempre sea un string
                  form.setFieldValue("comuna", ""); // 🔹 Reinicia comuna cuando cambia región
                }}
            />
            )
          }}
        </Field>
        {/* {errors.region && touched.region && <p className="text-red-500 text-sm">{errors.region}</p>} */}
      </div>
      <div className="w-2/8">
      {comunasPorRegion && (
        <Field
          as={CustomSelect}
          label="Comuna"
          name='comuna'
          options={comunasPorRegion || []}
          placeholder="Seleccione la comuna"
          disabled={!regionSelected}
          width="100%"
          required          
        />
      )}
      </div>
      <div className="w-3/6">
        <Field
            name="direccion"
            type="text"
            as={CustomInput} // Usa CustomInput como componente renderizado
            label="Dirección"
            placeholder="Ingresa la dirección del proyecto"
            captionPosition="top"
            error={touched.direccion && errors.direccion ? errors.direccion : undefined}
            required
            theme="light"
            width="100%" // Define el ancho como un porcentaje
        />
      </div>      
    </div>
  );
};
