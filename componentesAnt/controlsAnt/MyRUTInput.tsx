import { useField, useFormikContext, ErrorMessage } from 'formik';
import { formatRut } from '@/utils/formatRut';
import { useLabels } from '@/hooks/ohers/useLabels';

interface MyRUTInputProps {
  label: string;
  name: string;
  type?: 'text'| 'email' | 'password' | 'textarea' ;
  placeholder?: string;
  id?: string;
  theme: string;
  className?: string; 
  style?: React.CSSProperties; // Para estilos en línea
  inputProps?: { [key: string]: any }; // Atributos HTML adicionales
  conditionalStyles?: { [key: string]: React.CSSProperties }; // Estilos condicionales
  width?:string;
  [x:string]: unknown; 
}

const validateRUT = (value: string) => {
  console.log('validateRUT', value);
  const rut = value.replace(/\./g, '').replace('-', '');
  const body = rut.slice(0, -1);
  if (body.length <7 ){
    return 'RUT inválido. Debe tener mínimo 7 dígitos.';
  }
  const dv = rut.slice(-1).toUpperCase();
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const mod = 11 - (sum % 11);
  let expectedDv;
  if (mod === 11) {
    expectedDv = '0';
  } else if (mod === 10) {
    expectedDv = 'K';
  } else {
    expectedDv = mod.toString();
  }
  if (expectedDv !== dv) {
    return 'RUT inválido';
  }
  return '';
};

export const MyRUTInput: React.FC<MyRUTInputProps> = ({ 
  label,
  className,
  style,
  inputProps,
  autoComplete,
  theme,
  conditionalStyles,
  placeholder,
  width,
  ...props
}:MyRUTInputProps) => {
  const { setFieldValue } = useFormikContext();
  const { labels, error } = useLabels();
  const [field, meta] = useField({
    name:props.name,
    validate: validateRUT,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const formattedRUT = formatRut(value);
    setFieldValue(props.name, formattedRUT);
  };

  return (
    <div  className="mb-4">

          <label 
              //htmlFor={ 'rut'}
              className="block text-gray-700 font-medium mb-0"
              htmlFor={props.id || props.name}
              //className="block text-gray-700 font-medium mb-1"
           >
              {label}
          </label>
        <input
            style={{ width: `${width} || '300px'` }}
            //className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 `}
            className={`w-full p-2 border border-gray-300 rounded-md shadow-sm h-11
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 `}
            //id="rut"
            {...field}
            {...props}
            {...inputProps}
            type="text"
            onChange={handleChange}
            placeholder={placeholder}
        />
        <div className="text-red-500 text-sm mt-1">
            <ErrorMessage name={ props.name } component="span" />
        </div>
      </div>
    
  );
};
