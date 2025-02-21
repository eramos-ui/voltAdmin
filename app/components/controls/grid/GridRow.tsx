"use client";
import { useEffect, useRef, useState } from "react";
import { ColumnConfig } from "@/types/interfaces";
import { GridActions } from "./GridActions";

type GridRowProps<T> = {
    row: T;
    columns: ColumnConfig<T>[];
    actions: ("edit" | "delete")[];
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    rowHeight: string;
    padding: string;
    borderColor: string;
    borderWidth: string;
    actionsTooltips?: string[];
    actionsPositionTooltips?: ("left" | "right" | "top" | "bottom")[];
    borderVertical?: boolean;  
    selectable?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
    fontSize?: string;
  };
  //const MAX_COLUMN_WIDTH = 200; // 📌 Define el ancho máximo por columna
  
  export const GridRow = <T,>({    
    row,
    columns,
    actions,
    onEdit,
    onDelete,
    rowHeight,
    padding,
    borderColor,
    borderWidth,
    actionsTooltips,
    actionsPositionTooltips,
    borderVertical = false,
    columnWidths, 
    updateColumnWidth, 
    selectable = false,
    isSelected = false,
    onSelect,
    fontSize ='13px'
    //maxGridWidth = 1200, // 🔹 Máximo ancho permitido para la grilla
}: GridRowProps<T> & {
  columnWidths: Record<string, string>; 
  updateColumnWidth: (colKey: string, newWidth: string) => void; 
}) => {
  //console.log('En GridRow columns',columns);
  const [ rowMaxHeight, setRowMaxHeight ] = useState<string>(rowHeight);

  const rowRef                            = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rowRef.current) {
      const maxHeight = Math.max(
        ...Array.from(rowRef.current.children).map((cell) => (cell as HTMLElement).offsetHeight)
      );
      setRowMaxHeight(`${maxHeight}px`);
    }
  }, [row]);

 useEffect(() => {
  if (!rowRef.current) return;
  //console.log('useEffect en GridRow',columns[0].key, row, isSelected);
  rowRef.current.querySelectorAll(`[data-col]`).forEach((cell) => {
    const colKey = cell.getAttribute("data-col") as string;
    const cellElement = cell as HTMLElement;
    const textLength = cellElement.innerText.length;
    const baseWidth = 10;
    const idealWidth = Math.min(baseWidth * textLength, 300);
    if (idealWidth > parseInt(columnWidths[colKey] || "150", 10)) {
      updateColumnWidth(colKey, `${idealWidth}px`); // 📌 Actualiza el ancho en CustomGrid
    }
  });
}, [row]);
//console.log('rowRef',rowRef.current);
  return (
    <>
    {/* {console.log('JSX GridRow',columns)} */}
      <div
        ref={rowRef}
        onClick={selectable ? onSelect : undefined}
        style={{
          display: "flex",
          width: "100%", // Asegura que las filas ocupen el mismo ancho que el encabezado
          backgroundColor: isSelected ? "#d0ebff" : "white",
          cursor: selectable ? "pointer" : "default",
          borderBottom: `${borderWidth} solid ${borderColor}`,
          fontSize
        }}
      >
        {columns
          .filter((col) => col.visible !== false)
          .map((col) => {          
            let rawValue: string | number | null = row[col.key] as string | number | null;
            if (col.key === "NumActividad" && rawValue !== undefined && rawValue !== null) {
              rawValue = String(rawValue).replace(",", "."); 
            }
            const isNumber = col.type === "number";          
            const formattedValue = isNumber && typeof rawValue === "number"
              ? new Intl.NumberFormat("es-ES").format(rawValue) // Formato español con separadores de miles
              : String(rawValue ?? ""); // Convertir a string si no es número
            return (
              <div 
                key={String(col.key)} 
                ref={ rowRef }
                data-col={String(col.key)} // 🔹 Identificador para `querySelector`
                style={{
                  width: columnWidths[String(col.key)] || col.width || "150px", // Usa los mismos anchos que el encabezado
                  padding,
                  borderRight: borderVertical ? `${borderWidth} solid ${borderColor}` : "none",
                  //display: "flex",
                  //alignItems:  col.textAlign || "left",
                  textAlign: (col.textAlign)? col.textAlign : (col.type === "number") ?"right":"left",
                  //justifyContent: col.textAlign || "left",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  fontSize,
                }}
              >
                { formattedValue}
              </div> 

            )
        })}
        {actions.length > 0 && (
          <div style={{ padding }} >
          <GridActions
            row={row}
            actions={actions}
            onEdit={onEdit}
            onDelete={onDelete}
            tooltips={actionsTooltips}
            positions={actionsPositionTooltips}
          />
          </div>
        )}
      </div>
    </>
  );
};
