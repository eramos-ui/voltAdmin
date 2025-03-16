import { FormFieldDFType } from "@/types/interfaceDF"; 
import {  Field, FormikErrors, FormikTouched  } from "formik";

import { CustomFileInput,  CustomInput, CustomSelect } from "@/components/controls";
      
//import { fetchOptionsFromDatabase } from '@/utils/fetchOptionsFromDatabase';
import { useEffect, useState } from "react";
import { LoadingIndicator } from "../general/LoadingIndicator";


interface Option {
  value: string | number;
  label: string;
}
interface FieldComponentDFProps {
  field: FormFieldDFType;
  values: any;//una fila de la grilla
  //handleChangeRow: (values: any | any[], fieldName: string, options: { value: string | number; label: string }[] | undefined) => void;
  setFieldValue: (fieldName: string, value: any) => void;
  touched: FormikTouched<any>;
  errors: FormikErrors<any>;
  theme: string;
}
//Este componente distribuye, para cada columna de la grilla, los diferentes custom control del formulario dinámico
export const FieldComponentDF: React.FC<FieldComponentDFProps> = ({ field, values, setFieldValue, errors, touched, theme }) => {

//   console.log('en FieldComponentDF values',values);  
  const [ datosSelect, setDatosSelect ]         = useState<Option[]>(); // Estado local para las opciones
  const [ loading, setLoading ]                 = useState(false);

  const { type, label, name, visible, autoComplete, options, width,  spFetchOptions,  rows,
     dependentValue,...props} = field;
  const errorMessage = errors[name] ? String(errors[name]) : undefined;// Obtener error de este campo
  const isTouched             = touched[name]; // Verificar si el campo ha sido tocado   

  const fieldName=field.name;
//   if (fieldName.includes('rut'))  console.log('en FieldComponentDF field',type,fieldName,errorMessage, isTouched );

    let staticOptions: { value: string | number; label: string }[] = options || [];
    if (spFetchOptions && spFetchOptions.length>0 && type  ==='select'){//resuelve las options cuando es sp 
  }
  useEffect(() => {//resuelve antes de enviar a CustomSelect las opciones si son dinámicas vía sp
    if (!spFetchOptions || !(type ==='select' || type==='multiselect')  ) return;
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const [spName, params] = spFetchOptions.split('(');// Se extrae del nombre del SP y los parámetros de la cadena spFetchOptions
        if (!params || params.trim() === ')') {// Si no hay parámetros, simplemente se ejecuta el SP
          const response = await fetch('/api/execSP', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storedProcedure: spName,
              parameters: {},
            }),
          });          
          if (response.ok) {
            const data = await response.json();
            const formattedOptions = data.map((item: any) => ({
              value: item.value, // Ajustar estos campos según el resultset
              label: item.label, // Ajustar estos campos según el resultset
            }));
            setLoading(false);
            setDatosSelect( formattedOptions);
          } else {
            console.error('Error al obtener las opciones');
          };
          setLoading(false);
        }

      } catch (err) {
        console.error('Error fetching options:', err);
      } 
      setLoading(false);      
    };
     fetchOptions();
  }, [spFetchOptions, dependentValue,type]);
  if (loading) <LoadingIndicator />
 //if (field.name === 'rut') { console.log('en FieldComponentDF field',type,field,fieldName,errors?.rut, touched?.rut )};
  switch (type) {
      case 'input':
      case 'text':
      case 'password':
      case 'email':
       // if (type==='email') console.log('en FieldComponentDF field',type,field,fieldName,errors[fieldName], touched[fieldName] );
        return (
            <div>
                <Field as={CustomInput}  type={(type ==='text' || type ==='input')?'text':type} width={width}
                name={name}
                label={label}
                required={field.validations?.some(v => v.type === "required")}
                error={isTouched && errorMessage ? errorMessage : undefined} // 🔹 Muestra el error solo si touched.rut === true (si se ingresó un valor)
                />
             </div> 
        )
      case 'select'://OJO no usa <Field>
        const dataSelect=(options && options.length>0 )?staticOptions : datosSelect;
        return (
          dataSelect &&
          <CustomSelect label={label}  width= {field.width } options={dataSelect} name={name}
          value={values[fieldName]}
          onChange={(value)=>setFieldValue(fieldName,value)}
          />
        )
       case 'multiselect'://falta probar
        return (
            staticOptions &&
            <CustomSelect label={label}  width= {field.width } options={staticOptions} multiple={true} name={name}
                value={String(field?.value)} //es un array de string
                onChange={(values)=>setFieldValue(fieldName,values)}
            />)

      case 'number':
        return <CustomInput label={label}  width={width} type='number' visible={visible} 
        value={values[fieldName]}
        onChange={(e)=>setFieldValue(fieldName,e.target.value)}
        />
      case 'RUT':
        // console.log('en FieldComponentDF field',type,field,fieldName,errorMessage, isTouched );
        return (
            <Field as={CustomInput}  type='RUT' width={width}  visible={visible}
            name={name}
            label={label}
            required={field.validations?.some(v => v.type === "required")}
            error={isTouched && errorMessage ? errorMessage : undefined} // 🔹 Muestra el error solo si touched.rut === true (si se ingresó un valor)
            />
        )
      case 'file'://probar OJO no usa <Field>
        return <CustomFileInput label={label} name={name}  width={width}  accept={".img, .jpg, .png"}  />;
      default:
        throw new Error(`El type: ${type} no es soportado`);
    }
  };