
import { useField, useFormikContext } from 'formik';

interface Props {
  label: string;
  name: string;
  options: { id: string | number; label: string }[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  width:string; 
}

export const MyRadioGroup: React.FC<Props> = ({ label, options, orientation='vertical', ...props }) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(props);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(field.name, event.currentTarget.value);
  };

  return (
    <div className={`radio-group-container ${orientation}`}>
      <label>{label}</label>
      {options.map(option => (
        <label key={option.id}>
          <input
            type="radio"
            {...field}
            value={option.id}
            checked={field.value === option.id}
            onChange={handleChange}
          />
          {option.label}
        </label>
      ))}
      {meta.touched && meta.error ? (
        <div className="error-message">{meta.error}</div>
      ) : null}
    </div>
  );
};