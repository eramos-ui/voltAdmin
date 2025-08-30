import { CustomLabel } from "@/components/controls";
import { useFormikContext } from "formik";

interface SendEmailButtonProps {
  handleSendEmail: (values: any,caso:string) => void;
}

// export const SendEmailButton = ({ handleSendEmail }: SendEmailButtonProps) => {
export const SendEmailButton = ({  handleSendEmail }: SendEmailButtonProps) => {
  const { values } = useFormikContext<any>();
  // console.log('values',values);
  const count = Array.isArray(values.proveedoresSelected) ? values.proveedoresSelected.length : 0;

  if (!values.selectedTemplate || count === 0) return null;
  const proveedorLabel= count === 1 ? "proveedor" : "proveedores";
  return (
    <>
    <CustomLabel size="normal+" label={`📩 Envia correo a ${count} ${proveedorLabel} ` }   />
    <button
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      onClick={() => handleSendEmail(values,'pendiente')}
      type='button'
    >
      Enviar y dejar tarea pendiente 
      {/* 📩 Enviar correo a {count} {count === 1 ? "proveedor" : "proveedores"} */}
    </button>
    <button
      className="mt-4 ml-5 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      onClick={() => handleSendEmail(values,'completada')}
      type='button'
    >
      Enviar y cerrar tarea 
    </button>
    </>
  );
};
