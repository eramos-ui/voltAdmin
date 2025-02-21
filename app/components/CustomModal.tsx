import React from 'react';
import { CustomButton } from './controls';
export interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?:string;
  height?: string;   
  position?:"center" | "top" | "bottom" | "left" |"right";
}

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, width ='500px', height='1000px',  children, title, onClose, position='center' }) => {
  if (!isOpen) return null;
    // 📌 Posicionamiento flexible según la opción seleccionada
    const getPositionStyles = (): React.CSSProperties => {
      switch (position) {
        case "top":
          return { top: "10%", left: "50%", transform: "translate(-50%, 0)" };
        case "bottom":
          return { bottom: "10%", left: "50%", transform: "translate(-50%, 0)" };
        case "left":
          return { top: "50%", left: "10%", transform: "translate(0, -50%)" };
        case "right":
          return { top: "50%", right: "10%", transform: "translate(0, -50%)" };
        default: // "center"
          return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
      }
    };
  
  return (
    <div
      style={{
        position: "fixed", // Asegura que el modal esté encima
      
        top :0,
        left: 0,
        //width: "100vw",
        // height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente oscuro
        zIndex: 1000, // Alta prioridad en el apilamiento
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: "15px", // 📌 Espaciado superior
      }}
    >
      <div
        style={{
          //position: "absolute",
          //...getPositionStyles(),
          backgroundColor: "#fff", // Fondo blanco para el modal
          borderRadius: "8px",
          width: width, // Ancho del modal
          maxWidth: "90%", // Ajuste para pantallas pequeñas
          padding: "3px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Sombra para realzar
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch", 
          height: height, // 📌 Altura ajustable
          maxHeight: "85vh", // 📌 Limita el alto máximo para evitar desbordamiento
          overflowY: "auto", // 📌 Agrega scroll si el contenido es demasiado grande
          //pointerEvents: "none",
        }}
      >
        <div /* Header */
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "5px",
            width: "100%", 
          }}
        >
          {title && <h2 style={{ margin: 0, fontSize: "1.5rem" }}>{title}</h2>}
          <CustomButton 
             label='✖' tooltipPosition='left' tooltipContent='Cerrar el formulario' onClick={onClose}
             style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#555",
            }}
          />
        </div>
        <div /* Content */
          style={{
            display: "flex",
            flexDirection: "column", // Asegura que las filas estén en columna
            gap: "5px", // Define el espacio entre filas    
                 
            }}
        >
            {children}
        </div>
      </div>
    </div>
  );
};
export default CustomModal;
