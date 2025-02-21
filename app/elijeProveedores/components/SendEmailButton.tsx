import { ActivityEmailFilesType } from "@/types/interfaces";
import { useFormikContext } from "formik";

interface SendEmailButtonProps {
  handleSendEmail: (values: any) => void;
}

// export const SendEmailButton = ({ handleSendEmail }: SendEmailButtonProps) => {
export const SendEmailButton = ({  handleSendEmail }: SendEmailButtonProps) => {
  const { values } = useFormikContext<any>();

  const count = Array.isArray(values.proveedoresSelected) ? values.proveedoresSelected.length : 0;

  if (!values.selectedTemplate || count === 0) return null;

  return (
    <button
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      onClick={() => handleSendEmail(values)}
      type='button'
    >
      📩 Enviar correo a {count} {count === 1 ? "proveedor" : "proveedores"}
    </button>
  );
};
