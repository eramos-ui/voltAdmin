import { useEffect, useState } from 'react';
import { ErrorMessage, useField } from 'formik';
import { useSession } from 'next-auth/react';
import { useLabels } from '../../hooks/useLabels';

interface Option {
  id: string | number;
  label: string;
}
interface Props {
  label: string;
  name: string;
  options?: Option[]; 
  placeholder?: string;
  id?: string;
  theme:string;
  className?: string;
  //style?: React.CSSProperties; // Para estilos en línea, hace un pestañeo
  inputProps?: { [key: string]: any }; // Atributos HTML adicionales
  conditionalStyles?: { [key: string]: React.CSSProperties }; // Estilos condicionales
  spFetchOptions: string;
  //width:string;//ancho declarado para el control
  dependentValue: any;//dato para select anidado
  registroInicialSelect:string;
  [x:string]: unknown; 
}
export const MySelect: React.FC<Props> = ({ label, theme, className, conditionalStyles, inputProps, //style,
    options: propOptions = [], spFetchOptions, width, dependentValue, registroInicialSelect, ...props }) => {
  const [ field, meta, helpers ]  = useField(props);
  const { data: session, status } = useSession();//aquí están los datos del user si lo requiere el fetch

  const { labels, error }         = useLabels();
  const [ options, setOptions ]   = useState<Option[]>(propOptions); // Estado local para las opciones
  const [ loading, setLoading ]   = useState(false);
  console.log('mySelect',props.name,spFetchOptions,dependentValue);
  useEffect(() => {
    if (!spFetchOptions) return;
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const [spName, params] = spFetchOptions.split('(');// Se extrae del nombre del SP y los parámetros de la cadena spFetchOptions
        if (!params || params.trim() === ')') {// Si no hay parámetros, simplemente ejecutamos el SP
          const response = await fetch('/api/execSP', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storedProcedure: spName,
              parameters: {},
            }),
          });          
          if (response.ok) {
            const data = await response.json();
            const formattedOptions = data.map((item: any) => ({
              id: item.id, // Ajusta estos campos según tu resultset
              label: item.label, // Ajusta estos campos según tu resultset
            }));
            setOptions(formattedOptions);
          } else {
            console.error('Error al obtener las opciones');
          }
          setLoading(false);
          return;
        }
        // Manejar el caso donde hay parámetros
        const parameterNames = params.replace(')', '').split(',').map((param) => param.trim().replace('@', ''));
        //console.log('parameterNames',parameterNames);
        const parameters = parameterNames.reduce((acc, paramName) => {// Crear un objeto con los valores de los parámetros usando sus nombres reales
          // acc[`@${paramName}`] = combinedValues[paramName];
          acc[`@${paramName}`] = dependentValue;
          return acc;
        }, {} as Record<string, any>);
        //console.log('parameters',parameters);
        const response = await fetch('/api/execSP', {// Realizar la solicitud a la API
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storedProcedure: spName,
            parameters,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const formattedOptions = data.map((item: any) => ({//todos los sp deben devolver un seultset con id,label
            id: item.id, // Ajusta estos campos según tu resultset
            label: item.label, // Ajusta estos campos según tu resultset
          }));
          setOptions(formattedOptions);
        } else {
          console.error('Error al obtener las opciones');
        }
      } catch (err) {
        console.error('Error fetching options:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [spFetchOptions, dependentValue, session]);
  
  if (error) {
    return <div>{error}</div>;
  }
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    helpers.setValue(event.target.value);
  };
  const registroInicial=(registroInicialSelect)?registroInicialSelect: labels?.select.labelSelect+' '+ label
  if ( !labels ) return <></>; 
  return (
    <>
      <label htmlFor={props.id || props.name}   
         //className="block text-gray-700 font-medium mb-0"
         className={`block mb-0 font-medium  
          ${ theme === 'dark'
            ? 'text-white hover:text-gray-400'
            : 'text-gray-600 hover:text-gray-900'
          }`}
      >
        {label}
      </label>
      <select
        key={props.name}
         //style={{ width: `${width} || '250px'` }}//ancho declarado para los select en data del form
        className={`p-2 h-11 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            border border-gray-300 rounded-md shadow-sm focus:outline-none 
          ${ theme === 'dark' ?'text-black hover:text-gray-700':'text-gray-600 hover:text-gray-900'}   
          ${className}`}
         {...field}
         {...props}
         {...inputProps}
        onChange={handleChange} 
        value={field.value}
        disabled={loading} // Deshabilitar mientras se cargan las opciones
      >
        <option value="">{loading ? 'Loading...' : `${ registroInicial} ` }</option>
        {options.map((option) => (
          <option key={props.name+option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="text-red-500 text-sm mt-1">
        <ErrorMessage name={props.name} component="span" />
      </div>
    </>
  );
}; 