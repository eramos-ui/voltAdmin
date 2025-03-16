import React, { useEffect, useState } from 'react';
import { useField, useFormikContext, FormikContextType, FormikValues} from 'formik';
import './CustomSelect.css';

export interface CustomSelectProps {
  /**
    * caption to display
  */
  label: string;
  /**
    * value selected
  */  
  name?: string; // Nombre del campo en Formik
  /**
    * options
  */  
  options: { value: string | number ; label: string }[];
  /**
    * selected value without formik
  */  
  value?: string | string[]; // Puede ser string o array de strings si es múltipl
  style?: React.CSSProperties;
  width?: string ; 
  onChange?: (value: string | string[]) => void; // Acepta string o array de strings

  placeholder?: string;
  required?: boolean;
  theme?: 'light' | 'dark';
  multiple?: boolean;
  captionPosition?: 'top' | 'left';
  id?: string;
  enabled?:boolean;
  // dependentValue?: any;//dato para select anidado
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  name,
  options,
  value,
  style, 
  width='100%',
  onChange,
  placeholder = 'Seleccione una opción',
  required = false,
  theme = 'light',
  multiple = false,
  captionPosition = 'top',
  id,
  enabled=true,
  // dependentValue,
}) => {
  //console.log('en CustomSelect name',name);
  // Si está en un contexto de Formik, utiliza useField y useFormikContext
  //console.log('en CustomSelect',label,value);
  const formik = name ? useFormikContext<FormikContextType<FormikValues>>() : null;
  //const [field, meta] = useField(name);
  const [ field, meta ]                       = name ? useField(name) : [{}, {}];
  // const [ selectedInside, setSelectedInside ] = useState<string[] | string>();
  const [selectedInside, setSelectedInside]   = useState<string | string[]>(field.value ?? (multiple ? [] : ""));
  // const { values, setFieldValue }             = useFormikContext<any>(); 
  //if (name ==='valid')  console.log('en CustomSelect meta',name,meta);
  //const isFormikOnChange = onChange === formik?.handleChange;
  // console.log("onChange viene de Formik:", isFormikOnChange);
  // 📌 Obtener el valor actual correctamente (único o múltiple)
  // const selectedValue = name
  //   ? field.value || (multiple ? [] : "")
  //   : value || (multiple ? [] : "");
  const selectedValue = name ? field.value ?? (multiple ? [] : "") : value ?? (multiple ? [] : ""); 
  // 📌 Manejador de cambio con soporte para selección múltiple con checkboxes
 useEffect(() => {
  setSelectedInside(selectedValue);
 }, []);
  // 📌 Manejador para selección múltiple (checkboxes)
  /*
  const handleCheckboxChange = (checkedValue: string | number) => {
    let updatedValues: string[];
    const valueStr = String(checkedValue);
    console.log('handleCheckboxChange',selectedInside,valueStr);
    if (Array.isArray(selectedInside)) {
      if (selectedInside.includes(valueStr)) {
        updatedValues = selectedInside.filter(val => val !== valueStr);
      } else {
        updatedValues = [...selectedInside, valueStr];
      }
    } else {
      updatedValues = [valueStr];
    }

    setSelectedInside(updatedValues);
    if (formik && name) {
      formik.setFieldValue(name, updatedValues);
    }
    if (onChange && onChange !== formik?.handleChange) {
      onChange(updatedValues);
    }
  };
  */
  const handleCheckboxChange = (checkedValue: string | number) => {
    let updatedValues: string[];
    //console.log('handleCheckboxChange',checkedValue);
    
    if (Array.isArray(selectedValue)) {
      if (selectedValue.includes(checkedValue)) {
        updatedValues = selectedValue.filter(val => val !== checkedValue); // Quitar selección
      } else {
        updatedValues = [...selectedValue, checkedValue]; // Agregar selección
      }
    } else {
      updatedValues = [String(checkedValue)];
    }

    // 📌 Actualizar Formik si el componente está dentro de un formulario Formik
    if (formik && name) {
      // console.log('en CustomSelect handleCheckboxChange',name,updatedValues);
      formik.setFieldValue(name, updatedValues);
    }
    
    // 📌 Notificar el cambio al padre (si `onChange` está definido)
    if (onChange && onChange !== formik?.handleChange)  {
      onChange(updatedValues);
    }
    
  };
  // 📌 Manejador de cambio para selección única
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    //console.log('handleSelectChange',newValue);
    setSelectedInside(newValue);
    if (formik && name) {
      formik.setFieldValue(name, newValue);
    }
    // if (typeof onChange === "function") {
    //   onChange(newValue);
    // }
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={`custom-select-container ${theme} ${captionPosition}`}>
      <label className={`custom-select-label ${captionPosition}` } >
        {label} {required && '*'}
      </label>
      {multiple ? (
        <div className="custom-multiple-select" style={{ ...style, width }}>
          {options.map((option) => (
            <label key={option.value} className="custom-option">
              <input
                type="checkbox"
                checked={Array.isArray(selectedValue) && selectedValue.includes(option.value)}
                onChange={() => handleCheckboxChange(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      ) : (
        <select
          {...field} // 🔹 Pasa `onBlur` automáticamente que se ejecuta al salir del campo para validar en Formik
          id={id}
          name={name}
          // value={selectedValue}
          value={selectedInside}
          onChange={handleSelectChange}
          className="custom-select"
          style={{ ...style, width }}
          disabled={!enabled}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
           {/* 📌 Mostrar error si el campo ha sido tocado y tiene error */}
        {/* {meta.touched && meta.error && ( <div className="error-message">{meta.error}</div> )} */}
        {meta.error && <div className="error-message">{meta.error}</div>}    {/* dado que no fimcopma el meta.touched */}
    </div>
  );
};