"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomButton } from "../CustomButton";
import { faEdit,  faTrash } from "@fortawesome/free-solid-svg-icons";
type GridActionsProps<T> = {
    row: T;
    actions: ("edit" | "delete")[];
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    tooltips?: string[];
    positions?: ("left" | "right" | "top" | "bottom")[]; 
    labelButtomActions?: string[];
  };
  
  export const GridActions = <T,>({ row, actions, onEdit, onDelete, tooltips = [], positions = [], labelButtomActions=[] }: GridActionsProps<T>) => (
    <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
      {actions.includes("edit") && (
        <CustomButton
          label={ labelButtomActions[1] }
          onClick={() => onEdit?.(row)}
          buttonStyle="secondary"
          size="small"
          theme="light"
          icon={<FontAwesomeIcon icon={faEdit} />}
          iconPosition= {"left" }    
          style={{ color: "green", backgroundColor:"white"  }} 
          tooltipContent={tooltips[1] || "Modificar"}
          tooltipPosition={positions[1] || "top"} // Verificación de fallback
        />
      )}
      {actions.includes("delete") && (
        <CustomButton
          label={ labelButtomActions[2] }
          onClick={() => onDelete?.(row)}
          buttonStyle="secondary"
          size="small"
          theme="light"
          icon={<FontAwesomeIcon icon={faTrash} />}
          iconPosition= {"left" }  
          style={{ color: "red", backgroundColor:"white" }}  
          tooltipContent={tooltips[2] || "Eliminar"}
          tooltipPosition={positions[2] || "top"} // Verificación de fallback
        />
      )}
    </div>
  );
  