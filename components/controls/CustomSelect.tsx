import React, { useEffect, useState, useMemo } from 'react';
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
  value?: string | string[]; // Puede ser string o array de strings si es múltiple es un array de los
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

// Hook personalizado que maneja de forma segura useField
const useSafeField = (name?: string) => {
  // ✅ Siempre pasamos un nombre seguro a `useField()`
  const safeName = name ?? "__unused_field__"; // Un nombre ficticio que no afectará el formulario
  
  return useField(safeName);
};


// const useSafeField = (name?: string) => {
//   // Si no hay name, devolvemos valores por defecto
//   if (!name) {
//     return [
//       { value: undefined, onChange: () => {}, onBlur: () => {} },
//       { touched: false, error: undefined }
//     ];
//   }
  
//   // Si hay name, usamos useField
//   return useField(name);
// };

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
  // Usamos el hook personalizado que siempre se ejecuta
  const [field, meta] = useSafeField(name);
  // console.log('CustomSelect field',field,name);
  // Siempre inicializamos useFormikContext
  const formik = useFormikContext<FormikContextType<FormikValues>>() || { 
    handleChange: () => {}, 
    setFieldValue: () => {} 
  };
  
  // El valor seleccionado depende de si estamos usando Formik o no
  const selectedValue = useMemo(() => {
    return name ? field.value ?? (multiple ? [] : "") : value ?? (multiple ? [] : "");
  }, [name, field.value, value, multiple]);
  // const selectedValue = name 
  //   ? field.value ?? (multiple ? [] : "") 
  //   : value ?? (multiple ? [] : "");
  
  // Estado local para el valor seleccionado
  const [selectedInside, setSelectedInside] = useState<string | string[]>(
    selectedValue || (multiple ? [] : "")
  );
  
  // Actualizar el estado interno cuando cambia el valor externo
  // useEffect(() => {
  //   setSelectedInside(selectedValue);
  // }, [selectedValue]);
  
  // Manejador para selección múltiple (checkboxes)
  const handleCheckboxChange = (checkedValue: string | number) => {
    let updatedValues: string[];
    
    if (Array.isArray(selectedValue)) {
      if (selectedValue.includes(checkedValue)) {
        updatedValues = selectedValue.filter(val => val !== checkedValue); // Quitar selección
      } else {
        updatedValues = [...selectedValue, checkedValue]; // Agregar selección
      }
    } else {
      updatedValues = [String(checkedValue)];
    }

    // Actualizar Formik si el componente está dentro de un formulario Formik
    if (name) {
      formik.setFieldValue(name, updatedValues);
    }
    
    // Notificar el cambio al padre (si `onChange` está definido)
    if (onChange && onChange !== formik.handleChange) {
      onChange(updatedValues);
    }
  };
  // useEffect(()=>{
  //   console.log('CustomSelect selectedValue',selectedValue);
  // },[selectedValue]);
  // Manejador de cambio para selección única
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    
    setSelectedInside(newValue);
    
    if (name) {
      formik.setFieldValue(name, newValue);
    }
    
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
          {...(name ? field : {})} // Solo pasamos field si name está definido
          id={id}
          name={name}
          value={selectedInside as string}
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
      {/* Mostrar error si hay un error en meta */}
      {meta.error && <div className="error-message">{meta.error}</div>}
    </div>
  );
};