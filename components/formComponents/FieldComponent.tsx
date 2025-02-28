import { FormFieldType } from "@/types/interfaces"; 
import {MyDate, MyCheckbox, MyMultiSelect, MyNumberInput, MyRadioGroup, MySINInput , MyAutocomplete,
      MyRangeInput, MyReadOnlyText, MyRUTInput, MySelect, MySlider, MyTextarea, MyTextInput, MyToggleSwitch } from "@/componentesAnt/controlsAnt";     

import { CustomFileInput, CustomGrid, CustomInput, CustomSelect } from "@/components/controls";
import { FormGrid } from "./FormGrid";
      
import { fetchOptionsFromDatabase } from '@/utils/fetchOptionsFromDatabase';
import { useEffect, useState } from "react";
import { LoadingIndicator } from "../general/LoadingIndicator";
interface Option {
  value: string | number;
  label: string;
}
//Este componente distribuye sobre los diferentes custom control del formulario dinámico
export const FieldComponent: React.FC<{ field: FormFieldType, theme:string }> = ({ field, theme }) => {//theme es el del form (dark, light)
  //console.log('field',field);  
  const [ datosSelect, setDatosSelect ]         = useState<Option[]>(); // Estado local para las opciones
  const [ loading, setLoading ]                 = useState(false);

  const { type, label, name, placeholder, visible, autoComplete, options, width,  format, columns, rows, actions, 
     rowHeight, gridWidth, conditionalStyles, editFormConfig, columnWidths, spFetchOptions, registroInicialSelect, titleGrid, 
     labelGridAdd, dependentValue, spFetchRows, spFetchSaveGrid, objectGrid} = field;
    //console.log('FieldComponent spFetchRows',spFetchRows,spFetchSaveGrid)
    // const tailwindWidth = width ? `w-${Math.round((parseFloat(width) / 100) * 12)}/12` : 'w-full';
    // let selectOptions: {value: string | number; label: string }[] = options || [];
    // // export type InputType = 'text' | 'input' | 'email' | 'select' | 'password' | 'date' | 'checkbox' |'textarea' | 'readonly'
    //     | 'number' | 'file' | 'radio' | 'slider' | 'range' |'toggle' | 'grid' | 'multiselect'| 'autocomplete' |'rut' |'sin';
    // let staticOptions:{ id: string | number; label: string }[];
    const dependentValues='';
    //let staticOptions:StaticOptions[];
    let staticOptions: { value: string | number; label: string }[] = options || [];
    // if (options && options.length>0 && (type ==='select' || type==='multiselect') ){
    //   setDatosSelect(options);
    // }
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
        // const parameterNames = params.replace(')', '').split(',').map((param) => param.trim().replace('@', ''));
        
        // const parameters = parameterNames.reduce((acc, paramName) => {// Crear un objeto con los valores de los parámetros usando sus nombres reales
        //   acc[`@${paramName}`] = dependentValue;
        //   return acc;
        // }, {} as Record<string, any>);
        // const response = await fetch('/api/execSP', {// Realizar la solicitud a la API de un select con sp
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     storedProcedure: spName,
        //     parameters,
        //   }),
        // });
        // if (response.ok) {
        //   const data = await response.json();
        //   const formattedOptions = data.map((item: any) => ({//todos los sp deben devolver un seultset con id,label
        //     value: item.value, // Ajusta estos campos según tu resultset
        //     label: item.label, // Ajusta estos campos según tu resultset
        //   }));
        //   setLoading(false);
        //   return formattedOptions;
        // } else {
        //   console.error('Error al obtener las opciones');
        // }
      } catch (err) {
        console.error('Error fetching options:', err);
      } 
      setLoading(false);
      
    };
     fetchOptions();
     //console.log(' en useEffect spFetchOptions, dependentValue',spFetchOptions, dependentValue);
  }, [spFetchOptions, dependentValue,type]);
  if (loading) <LoadingIndicator />
  const handleChange=() =>{
    console.log('handleChange',field);
  }
    //if (type ==='grid') console.log( JSON.stringify(field, null, 2));
 //if (type  ==='select') console.log('FieldComponent type field', type,field);
    switch (type) {
      case 'input':
      case 'text':
      case 'password':
      case 'email':
         //console.log(' en FieldComponent field' ,field );
         return <CustomInput label={label}  width={width} value={(typeof field.value === 'string' || typeof field.value === 'number')?field.value:''}
              type={(type ==='text' || type ==='input')?'text':type}
         />
        // return (<MyTextInput type={type === 'input' ? 'text' : type} name={name} label={label} placeholder={placeholder} 
        //    theme={theme} className="text-input" autoComplete={autoComplete} width={width} />);
      // case 'readonly':
      //   return <MyReadOnlyText name={name} label={label} />;
      case 'select':
        //console.log('staticOptions,staticOptions',type,label,field?.value);
        const dataSelect=(options && options.length>0 )?staticOptions : datosSelect;
        return (
          dataSelect &&
          <CustomSelect label={label}  width= {field.width } options={dataSelect} value={String(field?.value)}
          onChange={handleChange}
          />
        )
        // return <MySelect label={label} name={name}  theme={theme} options={staticOptions} dependentValue={dependentValue} 
        //    className={`text-input w-[${field.width}]`} // Establecer ancho con Tailwind
        //    width= {field.width } // Esto es redundante con lo anterior
        //    spFetchOptions= {(spFetchOptions)? spFetchOptions:''} registroInicialSelect={registroInicialSelect}
        // />;

       case 'multiselect'://falta probar
       return (
        staticOptions &&
        <CustomSelect label={label}  width= {field.width } options={staticOptions} multiple={true} 
            value={String(field?.value)} //es un array de string
        />)

      //   const multiSelectOptions = options?.map(option => ({ value: option.id, label: option.label })) || [];
      //   return <MyMultiSelect label={label} name={name} options={multiSelectOptions}  width={width}  />;
      // case 'checkbox':
      //   return <MyCheckbox label={label} name={name} className="checkbox-input"  width={width}  />;
      // case 'textarea':
      //   return <MyTextarea label={label} name={name} placeholder={placeholder}  theme={theme}  width={width} />;
      case 'number':
        return <CustomInput label={label}  width={width} type='number' value={(typeof field.value === 'number')?field.value:''}
        />
        //return <MyNumberInput label={label} name={name} placeholder={placeholder}  theme={theme} visible={visible}  width={width}   />;
      // case 'sin':
      //   return <MySINInput label={label} name={name} placeholder={placeholder} className="text-input"  theme={theme}  width={width} />;
      case 'RUT':
        return <CustomInput label={label}  width={width} value={(typeof field.value === 'string' || typeof field.value === 'number')?field.value:''} type='RUT'
               />
        // return <MyRUTInput className="text-input" autoComplete={autoComplete} 
        //   label={label} name={name} placeholder={placeholder} theme={theme} width={width} 
        // />;
      case 'file':
        return <CustomFileInput label={label} name={name}  width={width}  accept={".img, .jpg, .png"}  />;
      // case 'radio':
      //   return <MyRadioGroup label={label} name={name} options={selectOptions} orientation={field.orientation || 'vertical'}  width={width}  />;
      // case 'slider':
      //   return <MySlider label={label} name={name} min={field.min!} max={field.max!} step={field.step!}   width={width} />;
      // case 'range':
      //   return <MyRangeInput label={label} name={name} min={field.min!} max={field.max!} step={field.step!}  width={width}  />;
      // case 'toggle':
      //   return <MyToggleSwitch label={label} name={name}  width={width} />;
      // case 'date':
      //   return <MyDate label={label} name={name} placeholder={placeholder} format={format} theme={theme}  width={width}  />;
      // case 'autocomplete':
      //   return <MyAutocomplete name={name} label={label} fetchOptions={fetchOptionsFromDatabase}  width={width} />;
      case 'grid':
        return (
         <> 
           {/* <CustomGrid 
           title="Actividades actuales" columns={columnsActivities} 
           data={values.activities} actions={["add", "edit", "delete"]} fontSize="13px"
         
          /> */}
          
          <FormGrid
            label={label}
            name={name}
            titleGrid={(titleGrid)?titleGrid:'Item'}
            labelGridAdd={(labelGridAdd)?labelGridAdd:'Agregar ítem'}
            objectGrid={(objectGrid)?objectGrid:'item' }
            allValues={dependentValues}
            spFetchRows={spFetchRows}
            spFetchSaveGrid={spFetchSaveGrid}
            columns={columns || []}
            rows={rows || []}
            actions={actions || []}
            columnWidths={columnWidths || []}
            rowHeight={rowHeight || '40px'}
            gridWidth={gridWidth || '100%'}
            editFormConfig={editFormConfig}
            field={field}
            width={width} 
          />
          </>    
        );
      default:
        throw new Error(`El type: ${type} no es soportado`);
    }
  };