

import { useField, useFormikContext } from 'formik';

interface Props {
  label: string;
  name: string;
  min: number;
  max: number;
  step: number;
  id?: string;
  className?: string;
  width:string; 
}

export const MySlider: React.FC<Props> = ({ label, min, max, step, ...props }) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(props);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(field.name, Number(event.currentTarget.value));
  };

  return (
    <div className="slider-container">
      <label htmlFor={props.id || props.name}>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        {...field}
        onChange={handleChange}
        className="slider-input"
      />
      <div className="slider-value">{field.value}</div>
      {meta.touched && meta.error ? (
        <div className="error-message">{meta.error}</div>
      ) : null}
    </div>
  );
};