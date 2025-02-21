
import Select, { MultiValue, ActionMeta } from 'react-select';
import { useField, useFormikContext } from 'formik';
import { FormValues } from '@/types/interfaces';


interface Option {
  value: string | number;
  label: string;
}

interface MyMultiSelectProps {
  label: string;
  name: string;
  options: Option[];
  width:string; 
}

export const MyMultiSelect: React.FC<MyMultiSelectProps> = ({ label, name, options }) => {
  const [field, meta, helpers] = useField(name);
  const { setFieldValue } = useFormikContext<FormValues>();

  const handleChange = (selectedOptions: MultiValue<Option>,
    actionMeta: ActionMeta<Option>) => {
    const value = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFieldValue(name, value);
    console.log('actionMeta',actionMeta); // Se puede usar actionMeta para manejar eventos específicos
  };

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <Select
        id={name}
        name={name}
        options={options}
        isMulti
        value={options ? options.filter(option => (field.value as Array<string | number>).includes(option.value)) : []}
        onChange={handleChange}
        onBlur={() => helpers.setTouched(true)}
        className="multi-select"
        classNamePrefix="multi-select"
      />
      {meta.touched && meta.error ? <div className="error-message">{meta.error}</div> : null}
    </div>
  );
};