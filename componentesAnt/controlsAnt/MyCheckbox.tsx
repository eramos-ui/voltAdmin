import { ErrorMessage, useField } from 'formik';


interface Props {
  label: string;
  name: string;
  id?: string;
  className?: string;
  [x: string]: unknown;
}
export const MyCheckbox = ( { label, ...props }: Props ) => {
    const [ field ] = useField({ ...props, type:'checkbox' } );//otro elemento es el meta dice si hay errores si ha sido tocado..
  return (
    // <div>
    <div className="flex items-center space-x-2">
      <label className="inline-flex items-center">
      {/* <label className="checkbox-label"> */}
        <input type='checkbox' { ...field } { ...props } 
        className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
      />
       <span className="ml-2 text-gray-700">{label}</span>
        {/* {label} */}
      </label>
      <ErrorMessage name={props.name} component="span" />
      <div className="text-red-500 text-sm mt-1">
      {/* <div className="error-container"> */}
          {/* <ErrorMessage name={props.name} component="span" className="error-message" /> */}
          <ErrorMessage name={props.name} component="span" />
      </div>
    </div>
  )
}
