
"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ColumnConfigType } from "@/types/interfaces";
import {GridActions} from "./GridActions";

type GridRowProps<T> = {
    row: T;
    columns: ColumnConfigType<T>[];
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
  const [ rowMaxHeight, setRowMaxHeight ] = useState<string>('20px');
  
  const rowElRef                          = useRef<HTMLDivElement>(null);
  // const rowRef                            = useRef<HTMLDivElement>(null);
  const widthsRef                         = useRef(columnWidths);
  useEffect(() => { widthsRef.current = columnWidths; }, [columnWidths]);
  useLayoutEffect(() => {
    const rowEl = rowElRef.current;
    if (!rowEl) return;
  
    const updates: Array<[string, string]> = [];
    rowEl.querySelectorAll<HTMLElement>('[data-col]').forEach((cell) => {
      const colKey = cell.getAttribute('data-col')!;
      // Mejor que innerText.length: mide contenido real
      const idealPx = Math.min(cell.scrollWidth + 16 /* padding aprox */, 300);
      const currPx = parseInt(widthsRef.current[colKey] || '150', 10);
      if (idealPx > currPx) updates.push([colKey, `${idealPx}px`]);
    });
  
    if (updates.length) {
      // aplica todos los cambios (1 render del padre por ciclo)
      updates.forEach(([k, w]) => updateColumnWidth(k, w));
    }
  // 👇 depende solo de “lo que cambia en la fila”
  }, [columns.map(c => String((row as any)[c.key] ?? '')).join('|')]);
  
//   useEffect(() => {
//     if (rowRef.current) {
//       const maxHeight = Math.max(
//         ...Array.from(rowRef.current.children).map((cell) => (cell as HTMLElement).offsetHeight)
//       );
//       setRowMaxHeight(`${maxHeight}px`);
//     }
//   }, [row]);//

//  useEffect(() => {
//   if (!rowRef.current) return;
//   console.log('useEffect en GridRow',columns[0].key, row, isSelected);
//   rowRef.current.querySelectorAll(`[data-col]`).forEach((cell) => {
//     const colKey = cell.getAttribute("data-col") as string;
//     const cellElement = cell as HTMLElement;
//     const textLength = cellElement.innerText.length;
//     const baseWidth = 10;
//     const idealWidth = Math.min(baseWidth * textLength, 300);
//     if (idealWidth > parseInt(columnWidths[colKey] || "150", 10)) {
//       updateColumnWidth(colKey, `${idealWidth}px`); // 📌 Actualiza el ancho en CustomGrid
//     }
//   });
// }, [row,updateColumnWidth,columnWidths]);//
//console.log('rowRef',rowRef.current);
  return (
    <>
    {/* {console.log('JSX GridRow',columns)} */}
      <div
        ref={rowElRef}
        onClick={selectable ? onSelect : undefined}
        style={{
          display: "flex",
          width: "100%", // Asegura que las filas ocupen el mismo ancho que el encabezado
          backgroundColor: isSelected ? "#d0ebff" : "white",
          cursor: selectable ? "pointer" : "default",
          borderBottom: `${borderWidth} solid ${borderColor}`,
          height:rowHeight,
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
                // ref={ rowRef }
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
                {col.renderCell ? col.renderCell(row) : formattedValue}
                {/* { formattedValue} */}
              </div> 

            )
        })}
        {actions.length > 0 && (
          <div style={{ justifyContent:'center', justifyItems:'flex-end', }} 
          //decía style={{ padding }} 
          >
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
