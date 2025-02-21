
import { useField, useFormikContext } from 'formik';

interface Props {
  label: string;
  name: string;
  min: number;
  max: number;
  step: number;
  className?: string;
  width:string; 
}

export const MyRangeInput: React.FC<Props> = ({ label, min, max, step, ...props }) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(props);

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value);
    setFieldValue(field.name, [value, field.value[1]]);
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value);
    setFieldValue(field.name, [field.value[0], value]);
  };

  return (
    <div className="range-input-container">
      <label>{label}</label>
      <div className="range-inputs">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={field.value[0]}
          onChange={handleMinChange}
          className="range-input"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={field.value[1]}
          onChange={handleMaxChange}
          className="range-input"
        />
      </div>
      <div className="range-values">
        <span>{field.value[0]}</span> - <span>{field.value[1]}</span>
      </div>
      {meta.touched && meta.error ? (
        <div className="error-message">{meta.error}</div>
      ) : null}
    </div>
  );
};