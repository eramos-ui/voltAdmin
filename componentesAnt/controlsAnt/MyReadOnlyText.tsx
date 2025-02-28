import { useField } from 'formik';

interface ReadOnlyTextProps {
  label: string;
  name: string;
}

export const MyReadOnlyText: React.FC<ReadOnlyTextProps> = ({ label, name }) => {
  const [field] = useField(name);

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        type="text"
        id={name}
        {...field}
        readOnly
        className="read-only-input"
      />
    </div>
  );
};
