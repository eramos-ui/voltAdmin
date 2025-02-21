

import { CustomTooltip } from './';

import "./CustomButton.css";

export interface CustomButtonProps {
  label: string;
  onClick?: () => void;
  theme?: "light" | "dark";
  buttonStyle?: "primary" | "secondary";
  size?: "large" | "small";
  disabled?: boolean;
  htmlType?: "button" | "submit" | "reset";
  isSubmitting?: boolean; // Nueva propiedad para manejar el estado de envío
  icon?: React.ReactNode; // Ícono para el botón
  iconPosition?: "left" | "right"; // Posición del ícono
  style?: React.CSSProperties;  
  tooltipContent?: React.ReactNode;
  tooltipPosition?: "top" | "bottom" | "left" | "right"; }

export const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  theme = "light",
  buttonStyle = "primary",
  size = "large",
  disabled = false,
  htmlType = "button",
  isSubmitting = false, // Valor predeterminado
  icon,
  iconPosition = "left",
  style,
  tooltipContent,
  tooltipPosition = "top",
}) => {
  const handleClick = () => {
    if (!isSubmitting && onClick) {
      onClick();
    }
  };
  const buttonElement =(
    <div>    
      <button
        className={`custom-button ${theme} ${buttonStyle} ${size} ${disabled || isSubmitting ? "disabled" : ""}`}
        // onClick={handleClick}
        onClick={(e) => {
          //e.stopPropagation(); // 🔹 Evita problemas de propagación de eventos
          console.log("Botón clickeado:", label); // 📌 Depuración
          if (onClick) {
            console.log("Ejecutando onClick...");
            onClick();            
          } else {
            console.warn("⚠️ No hay función onClick asignada al botón");
            
          }
        }}
        disabled={disabled || isSubmitting}
        type={htmlType}
        style={style} 
      >
        {icon && iconPosition === "left" && (
          <span className="button-icon left">{icon}</span>
        )}
        {isSubmitting ? "Enviando..." : label}
        {icon && iconPosition === "right" && (
          <span className="button-icon right">{icon}</span>
        )}
      </button>

    </div>
  );
  return (
    <div>
      { tooltipContent ? (
        <CustomTooltip content={tooltipContent} position={tooltipPosition} theme={theme} offset={10}>
          {buttonElement}
        </CustomTooltip>
      ) : (
        buttonElement
      )}
    </div>
  );
};
