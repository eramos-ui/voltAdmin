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
  // Definimos valores por defecto para los hooks de Formik
  const formikNoop = { handleChange: () => {}, setFieldValue: () => {} };
  const fieldNoop = { value: undefined, onChange: () => {}, onBlur: () => {} };
  const metaNoop = { touched: false, error: undefined };
  
  // Inicializamos useFormikContext y useField solo si name está definido
  // Esto evita que los hooks se llamen condicionalmente
  const formik = useFormikContext<FormikContextType<FormikValues>>() || formikNoop;
  
  // Para los campos de Formik, usamos useField solo si name está definido
  const [field, meta] = name 
    ? useField(name) 
    : [fieldNoop, metaNoop];
  
  // El valor seleccionado depende de si estamos usando Formik o no
  const selectedValue = name 
    ? field.value ?? (multiple ? [] : "") 
    : value ?? (multiple ? [] : "");
  
  // Estado local para el valor seleccionado
  const [selectedInside, setSelectedInside] = useState<string | string[]>(
    selectedValue || (multiple ? [] : "")
  );
  
  // Actualizar el estado interno cuando cambia el valor externo
  useEffect(() => {
    setSelectedInside(selectedValue);
  }, [selectedValue]);
  
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