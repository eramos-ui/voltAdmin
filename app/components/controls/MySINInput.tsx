import { useField, useFormikContext, ErrorMessage } from 'formik';
import {formatSIN} from '../../utils/formatSIN';
import { useLabels } from '../../hooks/useLabels';

interface MySINInputProps {
  label: string;
  name: string;
  type?: 'text'| 'email' | 'password' | 'textarea' ;
  placeholder?: string;
  id?: string;
  className?: string; 
  style?: React.CSSProperties; // Para estilos en línea
  inputProps?: { [key: string]: any }; // Atributos HTML adicionales
  conditionalStyles?: { [key: string]: React.CSSProperties }; // Estilos condicionales
  [x:string]: unknown; 
}

const validateSIN = (value: string) => {
  const sin = value.replace(/\s/g, ''); // Elimina espacios

  if (!/^\d{9}$/.test(sin)) {
    return 'SIN inválido. Debe tener 9 dígitos.';
  }
  // Algoritmo de Luhn 
  let sum = 0;
  for (let i = 0; i < sin.length; i++) {
    let digit = parseInt(sin[i], 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  if (sum % 10 !== 0) {
    return 'SIN inválido.';
  }
  return '';
};

export const MySINInput: React.FC<MySINInputProps> = ({ 
 label,
 className,
 style,
 inputProps,
 conditionalStyles,
 placeholder,
 ...props
}: MySINInputProps) => {
  const { setFieldValue } = useFormikContext();
  const { labels, error } = useLabels();
  const [ field, meta ]   = useField(
    {
    name: props.name,
    validate: validateSIN,
  }
  );
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     const value = event.target.value;
     const formattedSIN = formatSIN(value);
     setFieldValue(props.name, formattedSIN);
  };
  if (!labels) return  (<div>Loading labels...</div>);
  return (
    <>
      <div>
        <div className="form-field">
          <label htmlFor={ props.name}
            // className="block text-gray-700 font-medium mb-1"
            //className="block text-gray-700 dark:text-gray-300 font-medium mb-1"
          >
            {label}
          </label>
          <input
             className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
             {...field}
             {...props}
             {...inputProps}
            // id={name}
            type="text"
            onChange={handleChange}
            placeholder={placeholder}
          />
        <div className="text-red-500 text-sm mt-1">
          <ErrorMessage name={ props.name } component="span" />
        </div>
        </div>
      </div>
    </>
  );
};
