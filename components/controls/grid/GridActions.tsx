"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomButton } from "../CustomButton";
import { faEdit,  faTrash } from "@fortawesome/free-solid-svg-icons";
import { toPx } from "@/utils/toPx";
type GridActionsProps<T> = {
    row: T;
    actions: ("edit" | "delete" | "add")[];
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    rowHeight?: string; //de la row de la grilla
    fontSizePx?:string;//del ícono de botón de action
    iconSizePx?:string;//del ícono de botón de action
    paddingX?:string;//del ícono de botón de action
    tooltips?: string[];
    positions?: ("left" | "right" | "top" | "bottom")[]; 
    labelButtomActions?: string[];
  };
  
  export const GridActions = <T,>({ row, actions, onEdit, onDelete, rowHeight, fontSizePx, iconSizePx, paddingX,
     tooltips = [], positions = [], labelButtomActions=[] }: GridActionsProps<T>) => 
     {
      const height=toPx(rowHeight, 24);
      const fontSize=toPx(fontSizePx, 14);
      const iconSize=toPx(iconSizePx, 14);;
      const padding=toPx(paddingX,8);
       return   (
        <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
          {actions.includes("edit") && (
            <CustomButton
              label={ labelButtomActions[1] }
              onClick={() => onEdit?.(row)}
              buttonStyle="secondary"
              // size="small"
              theme="light"
    
              height={height} fontSizePx={fontSize} iconSizePx={iconSize} paddingX={padding}
              icon={<FontAwesomeIcon icon={faEdit} />}
              iconPosition= {"left" }    
              style={{ color: "green", backgroundColor:"white" ,marginBottom:'15px'  }} 
              tooltipContent={tooltips[1] || "Modificar"}
              tooltipPosition={positions[1] || "top"} // Verificación de fallback
            />
          )}
          {actions.includes("delete") && (
            <CustomButton
              label={ labelButtomActions[2] }
              onClick={() => onDelete?.(row)}
              buttonStyle="secondary"
              // size="small"
              theme="light"
              height={height} fontSizePx={fontSize} iconSizePx={iconSize} paddingX={padding}
    
              icon={<FontAwesomeIcon icon={faTrash} />}
              iconPosition= {"left" }  
              style={{ color: "red", backgroundColor:"white",marginBottom:'25px' }}  
              tooltipContent={tooltips[2] || "Eliminar"}
              tooltipPosition={positions[2] || "top"} // Verificación de fallback
            />
          )}
        </div>
       )
     }
    