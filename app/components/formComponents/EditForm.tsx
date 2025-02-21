"use client";
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useSession } from 'next-auth/react';
import bcrypt from 'bcryptjs';
import { EditFormProps,  FormValues  } from '../../../types/interfaces';

import EditFormFields from './EditFormFields';
import { CustomAlert } from '../controls';
import { saveFormData } from '../../utils/apiHelpers';
import { formatRut } from '../../utils/formatRut';

export const EditForm: React.FC<EditFormProps> = ({
  formConfig,
  isOpen,
  onClose,
  initialValues,
  isAdding,
  spFetchSaveGrid,
  requirePassword,
}) => {
  const { theme: themeEdit, formSize, formTitle, modalStyles } = formConfig;
  const { data: session } = useSession();
  
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertDuration, setAlertDuration] = useState<number | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
  const theme: 'light' | 'dark' = themeEdit === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    Modal.setAppElement('body');
  }, []);

  if (!isOpen) return null;    
  const showAlert = (message: string, type: 'success' | 'error' | 'info', duration: number | null) => {// Función para configurar la alerta
      setAlertMessage(message);
      setAlertType(type);
      setAlertDuration(duration);
   };
  const handleSubmit = async (values: FormValues) => {
    try {
      const password = requirePassword ? await bcrypt.hash('password123', 10) : undefined;
      const response = await saveFormData(
        spFetchSaveGrid!,
        { ...values, idUserModification: session?.user.id, password },
        formatRut,
      );

      if (response.success) {
        showAlert("Grabado exitosamente", "success", 3000);
        setTimeout(onClose, 3000);
      } else {
        showAlert(`Error al guardar los datos: ${response.error}`, "error", null);
      }
    } catch (error) {
      showAlert(`Error al guardar los datos: ${error}`, "error", null);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit Form Modal"
      ariaHideApp={false}
      style={{ content: modalStyles?.content || {} }}
    >
      <div> 
        <h3 className="text-lg font-bold mb-4">
          {isAdding ? `Agregar Información: ${formTitle}` : `Modificar Información: ${formTitle}`}
        </h3>
        {/* <div>  Contenedor del formulario y la alerta */}
          <EditFormFields
            formConfig={formConfig}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onClose={ onClose }
            theme={theme}
            />
            <div className="flex justify-between items-center mt-4">  {/* Contenedor para alinear alerta y botones */}
              {alertMessage && (
                <div className="flex-grow">
                {/* <div className="flex justify-end mt-6 space-x-4"> */}
                  <CustomAlert
                    message={alertMessage}
                    duration={alertDuration}
                    type={alertType}
                    onClose={() => setAlertMessage(null)}
                    theme={theme}
                  />
                </div>
              )}   

            </div>    
          </div>
      {/* </div> */}
    </Modal>
  );
};
