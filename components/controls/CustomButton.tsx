import { CustomTooltip } from ".";
import "./CustomButton.css";
import React from "react";

export interface CustomButtonProps {
  label: string;
  onClick?: () => void;
  theme?: "light" | "dark";
  buttonStyle?: "primary" | "secondary";
  size?: "large" | "small" | "medium";         // preset
  /** ⬇️ NUEVO: alto en px (tiene prioridad sobre size) */
  height?: number;
  /** ⬇️ NUEVO: tamaño del ícono en px (si no, deriva del alto) */
  iconSizePx?: number;
  /** ⬇️ NUEVO: tamaño de fuente en px (si no, deriva del alto) */
  fontSizePx?: number;
  /** ⬇️ NUEVO: padding horizontal en px */
  paddingX?: number;

  disabled?: boolean;
  htmlType?: "button" | "submit" | "reset";
  isSubmitting?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: React.CSSProperties;
  tooltipContent?: React.ReactNode;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  formRef?: React.RefObject<HTMLFormElement | null>;
}

const PRESETS = {
  small: 32,
  medium: 38,
  large: 44,
} as const;

export const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  theme = "light",
  buttonStyle = "primary",
  size = "large",
  height,
  iconSizePx,
  fontSizePx,
  paddingX,
  disabled = false,
  htmlType = "button",
  isSubmitting = false,
  icon,
  iconPosition = "left",
  style,
  tooltipContent,
  tooltipPosition = "top",
  formRef,
}) => {
  // Alto efectivo
  const H = height ?? PRESETS[size] ?? PRESETS.large;

  // Derivaciones (puedes ajustar las proporciones)
  const FS = fontSizePx ?? Math.max(11, Math.round(H * 0.4));   // fuente ~40% del alto
  const PX = paddingX ?? Math.round(H * 0.5);                   // padding X
  const ICON = iconSizePx ?? Math.round(H * 0.55);              // ícono ~55% del alto

  const cssVars: React.CSSProperties = {
    // variables CSS para que el .css controle todo
    ["--btn-h" as any]: `${H}px`,
    ["--btn-fs" as any]: `${FS}px`,
    ["--btn-px" as any]: `${PX}px`,
    ["--btn-icon" as any]: `${ICON}px`,
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (htmlType === "submit" && formRef?.current) {
      event.preventDefault();
      formRef.current.requestSubmit();
      return;
    }
    if (!isSubmitting && onClick) {
      event.preventDefault();
      onClick();
    }
  };

  const button = (
    <button
      className={`custom-button ${theme} ${buttonStyle} ${size} ${
        disabled || isSubmitting ? "disabled" : ""
      }`}
      type={htmlType}
      onClick={handleClick}
      disabled={disabled || isSubmitting}
      aria-busy={isSubmitting}
      // ⬇️ aplica variables + tus estilos inline
      style={{ ...cssVars, ...style }}
    >
      {icon && iconPosition === "left" && (
        <span className="button-icon left">{icon}</span>
      )}
      {isSubmitting ? "Enviando..." : label}
      {icon && iconPosition === "right" && (
        <span className="button-icon right">{icon}</span>
      )}
    </button>
  );

  return tooltipContent ? (
    <CustomTooltip content={tooltipContent} position={tooltipPosition} theme={theme} offset={10}>
      {button}
    </CustomTooltip>
  ) : (
    button
  );
};


// import { CustomTooltip } from '.';

// import "./CustomButton.css";

// export interface CustomButtonProps {
//   label: string;
//   onClick?: () => void;
//   theme?: "light" | "dark";
//   buttonStyle?: "primary" | "secondary";
//   size?: "large" | "small" | "medium";
//   disabled?: boolean;
//   htmlType?: "button" | "submit" | "reset";
//   isSubmitting?: boolean; // Nueva propiedad para manejar el estado de envío
//   icon?: React.ReactNode; // Ícono para el botón
//   iconPosition?: "left" | "right"; // Posición del ícono
//   style?: React.CSSProperties;  
//   tooltipContent?: React.ReactNode;
//   tooltipPosition?: "top" | "bottom" | "left" | "right"; }

// export const CustomButton: React.FC<CustomButtonProps> = ({
//   label,
//   onClick,
//   theme = "light",
//   buttonStyle = "primary",
//   size = "large",
//   disabled = false,
//   htmlType = "button",
//   isSubmitting = false, // Valor predeterminado
//   icon,
//   iconPosition = "left",
//   style,
//   tooltipContent,
//   tooltipPosition = "top",
// }) => {
//   const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//     // Si el botón es de tipo submit, dejar que el formulario maneje el evento
//     // console.log('handleClick',htmlType);
//     if (htmlType === "submit") return;
//     if (!isSubmitting && onClick) {
//       onClick();
//     }
//   };
//   const buttonElement =(
//     <div>    
//       <button
//         className={`custom-button ${theme} ${buttonStyle} ${size} ${disabled || isSubmitting ? "disabled" : ""}`}
//         onClick={handleClick}

//         disabled={disabled || isSubmitting}
//         type={htmlType}
//         style={style} 
//         aria-busy={isSubmitting} // Indica que el botón está en proceso
//       >
//         {icon && iconPosition === "left" && (
//           <span className="button-icon left">{icon}</span>
//         )}
//         {isSubmitting ? "Enviando..." : label}
//         {icon && iconPosition === "right" && (
//           <span className="button-icon right">{icon}</span>
//         )}
//       </button>

//     </div>
//   );
//   return (
//     <div>
//       { tooltipContent ? (
//         <CustomTooltip content={tooltipContent} position={tooltipPosition} theme={theme} offset={10}>
//           {buttonElement}
//         </CustomTooltip>
//       ) : (
//         buttonElement
//       )}
//     </div>
//   );
// };
