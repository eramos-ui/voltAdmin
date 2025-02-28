"use client";
import { useState } from 'react';
import { FormFieldType } from '@/types/interfaces';
import { FieldComponent } from '@/components/formComponents/FieldComponent';

interface FormRowProps {
  fields: FormFieldType[];
  theme:string;
  allValues?:any;
  maxWidth?:string;
  width?:string;
}
//renderiza los fields de c/fila de un frame o el form dynamic (vía row). Para ello utiliza el FieldComponent
export const FormRow: React.FC<FormRowProps> = 
  ({ fields, width, theme, allValues }) => {  
  //console.log('en FormRow allValues',allValues);
  //console.log('en FormRow fields',fields,fields.length);
  let newFields=fields.map( field =>{ //revisa si hay select con nested values, x ahora sólo acepta 1
    if (field.spFetchOptions?.includes('@')) {
        const fieldNested=field.spFetchOptions.split ('@')[1].split(')')[0];//soporta sólo 1 parámetro
        const fieldNestedValue=allValues[fieldNested];
        //console.log('en FormRow fieldNestedValue',fieldNestedValue);
        return {...field, dependentValue:fieldNestedValue} 
      }
      return field;           
  });
  if(fields && fields.length >1 ){//cuando es grilla viene un sólo fields y no requiere agregar el values
    newFields=newFields.map((ff:any)=>{
      if (ff.type=== 'grid') return;
        //console.log('det',ff,allValues[ff.name]);
        return {...ff, value:allValues[ff.name]};  
    })
  }
  // console.log('FormRow newFields',newFields);
  const [ dependentValues, setDependentValues ] =useState<any>(2);
  const groupedFields = newFields.reduce((acc, field, width) => {
    if (!acc[field.row]) {
      acc[field.row] = [];
    }
    acc[field.row].push(field);
    return acc;
  }, {} as { [key: number]: FormFieldType[] });
  //console.log('FormRow groupedFields',groupedFields);
  return (
    <> 
     { Object.keys(groupedFields).map(row => {
      if (!row) return null;
      console.log('en JSX FromRow  row',row);
      return (
        <div 
           className={`flex flex-wrap -mx-2 mb-4 w-[${width}]`} 
           key={row}           
        >
          {groupedFields[Number(row)].map(field => {
            //  console.log('en JSX  key',field,`${row}-${field.name}`);
           return ( 
            <div  key={`${row}-${field.name}`} className={`px-2`}  >
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
