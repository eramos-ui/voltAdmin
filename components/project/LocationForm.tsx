import { useEffect, useState } from "react";
import { useFormikContext, Field } from "formik";

import { Comunas, OptionsSelect, ProjectFormValuesType } from "@/types/interfaces";
import { CustomInput, SelectFormikSingle } from "../controls";


interface LocationFormProps {
  regiones: OptionsSelect[];
  // comunas: Comunas[] | undefined ;
  errors: any;
  touched: any;
}
export const LocationForm: React.FC<LocationFormProps> = ({ regiones,  errors, touched }) => {
  const { values, setFieldValue } = useFormikContext<ProjectFormValuesType>(); // ✅ Especifica el tipo // Hook de Formik para manejar valores
  // const [ regionSelected, setRegionSelected ] =useState<number>(0);
  // const [ comunaSelected, setComunaSelected ] =useState<number>(0);
  const [ comunasPorRegion, setComunasPorRegion ] = useState<OptionsSelect[]>(); 
  // console.log('En LocationForm values', values);
  // useEffect(() => {
  //   console.log('LocationForm useEffect comunasPorRegion', comunasPorRegion);
  // }, [comunasPorRegion]);
  const fetchComunas = async (idRegion: number): Promise<OptionsSelect[]> => {
    const res = await fetch(`/api/catalogs/comunas?idRegion=${idRegion}`);
    if (!res.ok) throw new Error('Error al cargar comunas');
    return await res.json();
   };

   useEffect(() => {
     if (values.idRegion>0) {
       fetchComunas(values.idRegion).then(setComunasPorRegion);
        console.log('En LocationForm useEffect comunasPorRegion idRegion', values.idRegion);
     }
  }, [values.idRegion]);
  return (
    <div className="mb-1 flex items-start space-x-2">
       <div className="w-2/7">
       <Field
         as={SelectFormikSingle}
         label="Región"
         name='idRegion'
         options={regiones  || []}
         placeholder="Seleccione una región"
         required
         theme="light"
         captionPosition="top"
         width="100%"
         value={values.idRegion}
         onChange={(value:number) => {
          setFieldValue('idRegion',Number(value));  
        }}
      />
      </div>
      <div className="w-3/7">
        <Field
          as={SelectFormikSingle}
          label="Comuna"
          name='idComuna'
          options={comunasPorRegion  || []}
          placeholder="Seleccione una comuna"
          required
          multiple={false}
          theme="light"
          captionPosition="top"
          width="100%"
          value={values.idComuna}
          onChange={(value:number) => {
            setFieldValue('idComuna',Number(value));  
          }}
        />
      </div>
      {/* <div className="w-3/9"> */}
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
            width="500px" // Define el ancho como un porcentaje
        />
      {/* </div>       */}
    </div>
  );
};