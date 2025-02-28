"use client";
import Select, { SingleValue, ActionMeta } from 'react-select';
import { useField, useFormikContext } from 'formik';
import { useEffect, useState } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface MyAutocompleteProps {
  label: string;
  name: string;
  fetchOptions: () => Promise<Option[]>;
  width:string; 
}

export const MyAutocomplete: React.FC<MyAutocompleteProps> = ({ label, name, fetchOptions  }) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadOptions = async () => {
      const options = await fetchOptions();
      setOptions(options);
      setLoading(false);
    };
    loadOptions();
  }, [fetchOptions]);
  const handleChange = (selectedOption: SingleValue<Option>, actionMeta: ActionMeta<Option>) => {
    setFieldValue(name, selectedOption ? (selectedOption as Option).value : '');
    console.log('actionMeta',actionMeta)
  };

   return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Select
          id={name}
          options={options}
          onChange={handleChange}
          value={options ? options.find(option => option.value === field.value) : null}
          className="multi-select"
          classNamePrefix="multi-select"
          // className="autocomplete-input"
          // classNamePrefix="autocomplete-select"
        />
      )}
      {meta.touched && meta.error ? (
        <span className="error-message">{meta.error}</span>
      ) : null}
    </div>
  );
};