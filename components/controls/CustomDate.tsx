"use client";
import {  useState,useContext } from 'react';
import { FormikContextType, useField, useFormikContext, FormikContext } from 'formik';
import DatePicker from 'react-datepicker';
import { format as formatDate, parse as parseDate } from 'date-fns';
import { es, enUS, fr } from 'date-fns/locale'; 
import 'react-datepicker/dist/react-datepicker.css';
import './CustomInput.css';

interface Props {
  label: string;
  captionPosition?: 'left' | 'top';
  name?: string;//viene sólo si es Formik
  onChange?: (date: string | null) => void;
  placeholder?: string;
  value?: string | Date | null; 
  textAlign?: 'left' | 'center' | 'right';  
  maxLength?: number;  
  id?: string; 
  theme: string;
  className?: string;
  // style?: React.CSSProperties; 
  format?: string;
  width:string; 
  disabled?:boolean;
  required?: boolean;
  visible?:boolean;
  withTime?: boolean;        // habilita selector de hora
  timeIntervals?: number;    // intervalo de minutos (p.ej. 5, 10, 15)
  timeCaption?: string;      // etiqueta del selector de hora
}
type Locales = 'es' | 'en' | 'fr';
const localeMapping = {  es,  en:enUS,  fr,};
const localeEnv = process.env.NEXT_PUBLIC_LOCALE as Locales || 'es';
const locale = localeMapping[localeEnv];

/**
 * 📌 Función que intenta parsear la fecha en ambos formatos: `dd/MM/yyyy` y `dd-MM-yyyy`
 */
// const parseFlexibleDate = (value: string): Date | null => {
//   if (!value || typeof value !== "string") return null;
//   const cleaned = value.trim();
//   for (const fmt of ['dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd']) {
//     const parsed = parseDate(cleaned, fmt, new Date());
//     if (!isNaN(parsed.getTime())) return parsed;
//   }
//   return null;
// };
const parseFlexibleDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string") return null;

  const cleaned = value.trim();
  const formats = [
    // fecha + hora
    "dd/MM/yyyy HH:mm", "dd-MM-yyyy HH:mm", "yyyy-MM-dd HH:mm",
    // solo fecha
    "dd/MM/yyyy", "dd-MM-yyyy", "yyyy-MM-dd",
  ];
  for (const fmt of formats) {
    const parsed = parseDate(cleaned, fmt, new Date());
    if (!isNaN(parsed.getTime())) return parsed;
  }
 

  const iso = new Date(cleaned);
  return isNaN(iso.getTime()) ? null : iso;
};
// Componente principal que redirige según esté o no en Formik
export const CustomDate: React.FC<Props> = (props) => {
  // console.log('props en CustomDate',props)
  if (props.name) {
    return <CustomDateWithFormik {...(props as Required<Props>)} />;
  } else {
    return <CustomDateStandalone {...props} />;
  }
};
// ✅ Con Formik
const CustomDateWithFormik: React.FC<Required<Props>> = ({
  name, label, theme, className = '', format = 'dd-MM-yyyy', disabled = false,
  captionPosition = 'top', required = false, visible = true,
  withTime = false, timeIntervals = 15, timeCaption = 'Hora', ...props
}) => {
  const [field, meta] = useField(name);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    parseFlexibleDate(field.value as string)
  );

  if (!visible) return null;

  const handleChange = (date: Date | null) => {
    setSelectedDate(date);
    const formatted = date ? formatDate(date, format) : '';
    field.onChange({ target: { name, value: formatted } });
  };
  return (
    <div   className={`custom-input-container ${theme} ${captionPosition}`} >
      <label
        htmlFor={props.id || name}
        style={{ marginBottom: captionPosition === "top" ? "0.5rem" : "0" }}
        // className={`custom-input-container ${theme} ${captionPosition} font-normal`}
        className={`custom-input-label ${captionPosition} `}
      >
        {label} {required && '*'}
      </label>
       <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat={withTime ? `${format} HH:mm` : `${format}`}
        id={props.id || name}
        locale={locale}
        disabled={disabled}
        className={`custom-input-field ${theme} `}
        placeholderText={props.placeholder}
        autoComplete="off"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        popperPlacement="bottom-start" /* 👇 controla la posición del calendario */
        popperProps={{ strategy: 'fixed' }}/* 👇 evita que se corte dentro de contenedores con overflow / transform */
        popperClassName="datepop"  /* 👇 útil si quieres aplicar un z-index propio */
        {...(withTime ? {
          showTimeSelect: true,
          timeFormat: 'HH:mm',
          timeIntervals,
          timeCaption
        } : {})}
      />
      {meta?.touched && meta?.error && (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      )}
    </div>
  );
};

// ✅ Sin Formik
const CustomDateStandalone: React.FC<Props> = ({
  label, format = 'dd-MM-yyyy', theme, className = '', disabled = false,
  captionPosition = 'top', required = false, value, visible = true, onChange, name, 
  withTime = false, timeIntervals = 15, timeCaption = 'Hora', ...props
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    parseFlexibleDate(value as string)
  );

  if (!visible) return null;

  const handleChange = (date: Date | null) => {
    setSelectedDate(date);
    const formatted = date ? formatDate(date, format) : null;
    onChange?.(formatted);
  };

  return (
    <>
      <label
        htmlFor={props.id || name}
        style={{ marginBottom: captionPosition === "top" ? "0.5rem" : "0" }}
        className={`custom-input-container ${theme} ${captionPosition} font-normal`}
      >
        {label} {required && '*'}
      </label>
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat={withTime ? `${format} HH:mm` : `${format}`}
        id={props.id || name}
       
        locale={locale}
        disabled={disabled}
        className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 
          focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 ${className}`}
        placeholderText={props.placeholder}
        autoComplete="off"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        popperPlacement="bottom-start"
        popperProps={{ strategy: 'fixed' }}
        popperClassName="datepop"
        {...(withTime ? {
          showTimeSelect: true,
          timeFormat: 'HH:mm',
          timeIntervals,
          timeCaption
        } : {})}
      />
    </>
  );
};



// "use client";
// import { useState } from 'react';
// import { useField, useFormikContext } from 'formik';
// import DatePicker from 'react-datepicker';
// import { format as formatDate, parse as parseDate } from 'date-fns';
// import { es, enUS, fr } from 'date-fns/locale'; 
// import 'react-datepicker/dist/react-datepicker.css';
// import './CustomInput.css';

// interface Props {
//   label: string;
//   captionPosition?: 'left' | 'top';
//   name: string;
//   placeholder?: string;
//   value?: string | Date | null; 
//   textAlign?: 'left' | 'center' | 'right';  
//   maxLength?: number;  
//   id?: string; 
//   theme: string;
//   className?: string;
//   format?: string;
//   width:string; 
//   disabled?:boolean;
//   required?: boolean;
//   visible?:boolean;
// }
// type Locales = 'es' | 'en' | 'fr';
// const localeMapping = {
//   es,
//   en:enUS,
//   fr,
// };
// const localeEnv = process.env.NEXT_PUBLIC_LOCALE as Locales || 'es';
// const locale = localeMapping[localeEnv];

// /**
//  * 📌 Función que intenta parsear la fecha en ambos formatos: `dd/MM/yyyy` y `dd-MM-yyyy`
//  */
// const parseFlexibleDate = (value: string): Date | null => {
//   if (!value) return null;
//   if (typeof value !== "string") {
//     console.error("⚠️ parseFlexibleDate recibió un valor no válido:", value);
//     return null;
//   }
//   const cleanedValue = value.replace(/\s/g, ''); // Elimina espacios en blanco
//   const parsedWithSlash = parseDate(cleanedValue, 'dd/MM/yyyy', new Date());
//   const parsedWithDash = parseDate(cleanedValue, 'dd-MM-yyyy', new Date());

//   // Si alguna conversión es válida, la retorna
//   return !isNaN(parsedWithSlash.getTime()) ? parsedWithSlash :
//          !isNaN(parsedWithDash.getTime()) ? parsedWithDash :
//          null;
// };

// //export const CustomDate: React.FC<Props> = ({ label, format = 'dd/MM/yyyy', theme, className, ...props }) => {
//   export const CustomDate: React.FC<Props> = ({ label, format = 'dd-MM-yyyy', theme, 
//     className,disabled=false,captionPosition='top', required=false, value, visible=true, ...props }) => {
//   const [ field, meta ] = useField( props );
//   const { setFieldValue } = useFormikContext();
//   const [ selectedDate, setSelectedDate ] = useState<Date | null>(
//     //field.value ? parseDate(field.value, format, new Date()) : null
//     field.value ? parseFlexibleDate(field.value) : null
//   );
//   console.log('CustomDate value',format,required,width);
//   //registerLocale('es', es);
//   if (!visible) return <></>;
//   const handleChange = (date: Date | null) => {
//     //if (date) {console.log('en CustomDate',date,formatDate(date, format))} else { console.log('CustomDate');};
//     setSelectedDate(date);
//     if (date) {
//       // 📌 Guardar en `dd-MM-yyyy` sin importar cómo se ingresó
//       setFieldValue(field.name, formatDate(date, 'dd-MM-yyyy'));
//       //setFieldValue(field.name, formatDate(date, format));
//     } else {
//       setFieldValue(field.name, '');
//     }
//   };
//   return (//ojo que viene en el className el del date y no es adecuado para el label
//     <>
//          {/* <label className={`custom-input-label ${captionPosition} `}
//           style={{ marginBottom: captionPosition === "top" ? "0.5rem" : "0" }}
//         >    
//           {labelFull} {required && '*'}
//         </label> */}
//       <label 
//         htmlFor={props.id || props.name}
//         style={{ marginBottom: captionPosition === "top" ? "0.5rem" : "0" }}      
//         className={`custom-input-container ${theme} ${captionPosition} font-normal`}
//       //  className={`block font-medium mb-1 ${
//       //   theme === 'dark'
//       //     ? 'text-gray-300'  // Texto claro para tema oscuro
//       //     : theme === 'light'
//       //     ? 'text-gray-700'  // Texto oscuro para tema claro
//       //     : 'text-blue-500'  // Texto alternativo para cualquier otro valor de tema
//       //   }`}
//       >{label}  {required && '*'}</label>
//       <DatePicker
//         selected={selectedDate}
//         onChange={handleChange}
//         //dateFormat={format.toLowerCase().replace(/d/g, 'd').replace(/m/g, 'M').replace(/y/g, 'y')}
//         dateFormat="dd-MM-yyyy" // 📌 Siempre muestra `dd-MM-yyyy`
//         className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 
//             focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 ${className}`}
//         placeholderText={props.placeholder}
//         id={props.id || props.name}
//         locale={locale}
//         autoComplete="off" 
//         showMonthDropdown
//         showYearDropdown 
//         dropdownMode="select"  
//         disabled={disabled}
//       />
//       {meta.touched && meta.error ? (
//         <div 
//           className="text-red-500 text-sm mt-1"
//         >{meta.error}</div>
//       ) : null}
//     </>
//   );
// };