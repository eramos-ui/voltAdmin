"use client";
import { useState } from 'react';
import { FormField } from '../../../types/interfaces';
import { FieldComponent } from '../FieldComponent';  


interface FormRowProps {
  fields: FormField[];
  theme:string;
  allValues?:any;
  maxWidth?:string;
  width?:string;
}

export const FormRow: React.FC<FormRowProps> = 
  ({ fields, width, theme, allValues }) => {  //renderiza los fields de c/fila de un frame o el form (vía row)
  //console.log('en FormRow allValues',allValues);
  const newFields=fields.map( field =>{ //revisa si hay select con nested values, x ahora sólo acepta 1
    if (field.spFetchOptions?.includes('@')) {
        const fieldNested=field.spFetchOptions.split ('@')[1].split(')')[0];//soporta sólo 1 parámetro
        const fieldNestedValue=allValues[fieldNested];
        return {...field, dependentValue:fieldNestedValue} 
      }
      return field;           
  })
  //console.log('newFields',newFields);

  const [ dependentValues, setDependentValues ] =useState<any>(2);
  const groupedFields = newFields.reduce((acc, field, width) => {
    if (!acc[field.row]) {
      acc[field.row] = [];
    }
    acc[field.row].push(field);
    return acc;
  }, {} as { [key: number]: FormField[] });
  return (
    <> 
     { Object.keys(groupedFields).map(row => {
      if (!row) return null;
        // console.log('en JSX  row',row);
      return (
        <div 
           className={`flex flex-wrap -mx-2 mb-4 w-[${width}]`} 
           key={row}           
        >
          {groupedFields[Number(row)].map(field => {
            //  console.log('en JSX  key',field,`${row}-${field.name}`);
           return ( 
            <div 
              key={`${row}-${field.name}`}
              className={`px-2`}
            >
              <FieldComponent field={field} theme={theme} />
            </div> )
          })}
        </div>
      );
     })}
    </>
  );
 }
;
