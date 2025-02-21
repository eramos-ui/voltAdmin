"use client";
import { useState } from 'react';
import { useField, useFormikContext } from 'formik';
import DatePicker from 'react-datepicker';
import { format as formatDate, parse as parseDate } from 'date-fns';
import { es, enUS, fr } from 'date-fns/locale'; 
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  label: string;
  name: string;
  placeholder?: string;
  id?: string;
  theme: string;
  className?: string;
  format?: string;
  width:string; 
}
type Locales = 'es' | 'en' | 'fr';
const localeMapping = {
  es,
  en:enUS,
  fr,
};
const localeEnv = process.env.NEXT_PUBLIC_LOCALE as Locales || 'en';
const locale = localeMapping[localeEnv];

/**
 * 📌 Función que intenta parsear la fecha en ambos formatos: `dd/MM/yyyy` y `dd-MM-yyyy`
 */
const parseFlexibleDate = (value: string): Date | null => {
  if (!value) return null;
  if (typeof value !== "string") {
    console.error("⚠️ parseFlexibleDate recibió un valor no válido:", value);
    return null;
  }
  const cleanedValue = value.replace(/\s/g, ''); // Elimina espacios en blanco
  const parsedWithSlash = parseDate(cleanedValue, 'dd/MM/yyyy', new Date());
  const parsedWithDash = parseDate(cleanedValue, 'dd-MM-yyyy', new Date());

  // Si alguna conversión es válida, la retorna
  return !isNaN(parsedWithSlash.getTime()) ? parsedWithSlash :
         !isNaN(parsedWithDash.getTime()) ? parsedWithDash :
         null;
};

//export const CustomDate: React.FC<Props> = ({ label, format = 'dd/MM/yyyy', theme, className, ...props }) => {
  export const CustomDate: React.FC<Props> = ({ label, format = 'dd-MM-yyyy', theme, className, ...props }) => {
  const [ field, meta ] = useField( props );
  const { setFieldValue } = useFormikContext();
  const [ selectedDate, setSelectedDate ] = useState<Date | null>(
    //field.value ? parseDate(field.value, format, new Date()) : null
    field.value ? parseFlexibleDate(field.value) : null
  );
  //registerLocale('es', es);
  const handleChange = (date: Date | null) => {
    //if (date) {console.log('en CustomDate',date,formatDate(date, format))} else { console.log('CustomDate');};
    setSelectedDate(date);
    if (date) {
      // 📌 Guardar en `dd-MM-yyyy` sin importar cómo se ingresó
      setFieldValue(field.name, formatDate(date, 'dd-MM-yyyy'));
      //setFieldValue(field.name, formatDate(date, format));
    } else {
      setFieldValue(field.name, '');
    }
  };
  return (//ojo que viene en el className el del date y no es adecuado para el label
    <>
      <label htmlFor={props.id || props.name}
       className={`block font-medium mb-1 ${
        theme === 'dark'
          ? 'text-gray-300'  // Texto claro para tema oscuro
          : theme === 'light'
          ? 'text-gray-700'  // Texto oscuro para tema claro
          : 'text-blue-500'  // Texto alternativo para cualquier otro valor de tema
        }`}
      >{label}</label>
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        //dateFormat={format.toLowerCase().replace(/d/g, 'd').replace(/m/g, 'M').replace(/y/g, 'y')}
        dateFormat="dd-MM-yyyy" // 📌 Siempre muestra `dd-MM-yyyy`
        className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 ${className}`}
        placeholderText={props.placeholder}
        id={props.id || props.name}
        locale={locale}
        autoComplete="off" 
        showMonthDropdown
        showYearDropdown 
        dropdownMode="select"  
      />
      {meta.touched && meta.error ? (
        <div 
        className="text-red-500 text-sm mt-1"
        >{meta.error}</div>
      ) : null}
    </>
  );
};