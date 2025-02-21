
import { ErrorMessage, useField } from 'formik';

interface Props {
    label: string;
    name: string;
    type?: 'text'| 'email' | 'password' | 'textarea' ;
    placeholder?: string;
    autoComplete?:'on' |'off';
    id?: string;
    theme: string;
    className?: string; 
    style?: React.CSSProperties; // Para estilos en línea
    inputProps?: { [key: string]: any }; // Atributos HTML adicionales
    conditionalStyles?: { [key: string]: React.CSSProperties }; // Estilos condicionales
    width?:string;
    [x:string]: unknown; 
}

export const MyTextInput = ( { 
  label,
  className,
  style,
  inputProps,
  theme,
  conditionalStyles,
  width,
  autoComplete="off",
  ...props
}: Props ) => {
  //const [ field ] = useField( props );//otro elemento es el meta dice si hay errores si ha sido tocado..
    const [field, meta] = useField(props); 
    //console.log('MyTextInput',style, width, theme)
    //console.log('conditionalStyles',conditionalStyles)
    const appliedStyles = { ...style };
    if (conditionalStyles) {
        Object.keys(conditionalStyles).forEach((key) => {
            if (key === 'value' && meta.value) {
                Object.assign(appliedStyles, conditionalStyles[key]);
            }
            // Otros chequeos condicionales pueden agregarse aquí
        });
    }
  return (
    <div className="mb-4">
      <label
        htmlFor={props.id || props.name}
        //className="block text-gray-700 font-medium mb-0"
        className={`block mb-0 font-medium ${
          theme === 'dark'
            ? 'text-white hover:text-gray-400'
            : 'text-gray-600 hover:text-gray-900'
          }`}
      >
        {label}
      </label>
      <input
        style={{ width: `${width}` || '300px' }}
        autoComplete={ autoComplete}
        //w-full
         className={`p-2 border text-black hover:text-gray-400 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}` }
        {...field}
        {...props}
        {...inputProps}
      />
      <div className="text-red-500 text-sm mt-1">
        <ErrorMessage name={props.name} component="span" />
      </div>
    </div>
  );
}
