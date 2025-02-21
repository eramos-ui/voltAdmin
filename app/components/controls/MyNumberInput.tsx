import { useField } from 'formik';

interface Props {
  label: string;
  name: string;
  placeholder?: string;
  id?: string;
  theme: string;
  className?: string;
  visible?:boolean;
  width:string; 
}

export const MyNumberInput: React.FC<Props> = ({ label, theme, visible,...props }) => {
  const [ field, meta ] = useField(props);
 // console.log('MyNumberInput', visible )
  const inputStyles = {
    backgroundColor: theme === 'dark' ? '#2d3748' : '#edf2f7',
    color: theme === 'dark' ? '#f7fafc' : '#1a202c',
    borderColor: theme === 'dark' ? '#4a5568' : '#cbd5e0',
    padding: '10px',
    borderRadius: '4px',
    width: '100%',
  };
  if (!visible) return <></>;
  return (
    <>
      <label htmlFor={props.id || props.name}>{label}</label>
      <input className="number-input" type="number" {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className="error-message">{meta.error}</div>
      ) : null}
    </>
  );
};