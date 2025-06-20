"use client";
import { useState } from "react";
import { CustomButton, CustomButtonProps } from "./CustomButton";
import { faPlus, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { GridRow } from "@/components/controls/grid/GridRow";
import { GridHeader } from "./grid/GridHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ExportConfig } from "./ExportConfig";
import { exportToExcel } from "@/utils/exportToExcel";
import { ColumnConfigType } from "@/types/interfaces";

export type CustomGridProps<T> = {
  title?: string; // Título de la grilla
  rowHeight?: string; // Alto de las filas (por ejemplo, "50px")
  rowsToShow?: number; // Número de filas a mostrar
  fontSize?: string;
  borderColor?: string; // Color del borde
  borderWidth?: string; // Ancho del borde
  padding?: string; // Padding dentro de cada celda
  marginBottom?: string; // Espaciado inferior de la grilla
  marginLeft?: string; // Espaciado izquierdo de la grilla
  gridWidth?: string; // Ancho total de la grilla
  columns: ColumnConfigType<T>[]; // Configuración de las columnas
  data: T[]; // Datos a mostrar en la grilla
  name?: string; // Campo del formulario donde se almacenará la data
  actions?: ("add" | "edit" | "delete")[]; // Acciones disponibles
  actionsTooltips?: string[]; // tooltips de las Acciones 
  actionsPositionTooltips?:  ("top" | "bottom" | "left" | "right")[]; // posición de los tooltips de las Acciones
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  addButtonProps?: Omit<CustomButtonProps, "onClick" | "label">; // Props para CustomButton
  labelButtomActions?: string[];
  exportable?: boolean; // Indica si la grilla es exportable  
  exportFileName?: string; // Nombre predeterminado del archivo exportado
  borderVertical?: boolean;
  selectable?: boolean;
  onRowSelect?: (row: T | null) => void; // 📌 Callback para manejar las filas seleccionadas
  isEditable?: (column: ColumnConfigType<T>, row: T) => boolean;
};

export const CustomGrid = <T,>({
  title,
  rowHeight = "30px",
  rowsToShow = 5,
  fontSize = "14px",
  borderColor = "#ccc",
  borderWidth = "1px",
  padding = "10px",
  marginBottom = "20px",
  gridWidth = "90%",
  columns,
  data,
  actions = [],
  onAdd,
  onEdit,
  onDelete,
  actionsTooltips = ["Agregar", "Modificar", "Eliminar"],
  actionsPositionTooltips = ["bottom", "bottom", "left"],
  labelButtomActions = ["Add", "", ""],
  exportable = false,
  borderVertical=false,
  selectable = false,
  onRowSelect,
  isEditable,
}: CustomGridProps<T>) => {
  // if (title==='Actividades actuales') console.log('en CustomGrid columns',title,columns);
  // if (title==='Actividades actuales') console.log('en CustomGrid data.length',data.length);
  const [columnWidths, setColumnWidths]           = useState<Record<string, string>>(
    Object.fromEntries(columns.map(col => [String(col.key), col.width || "150px"]))
  );
  const [ currentPage, setCurrentPage ]           = useState(0);
  const [ selectedGridRow, setSelectedGridRow ]   = useState<T | null>(null);

  //const rowsPerPage = rowsToShow || 5;
    // Calcular índices de paginación
  const startIndex = currentPage * rowsToShow;
  const endIndex = startIndex + rowsToShow;
  //console.log('en CustomGrid data',data);
  const totalPages = (data) ? Math.ceil(data.length / rowsToShow):0;
  //console.log('totalPages',totalPages,startIndex,endIndex);
  const paginatedData =(data) ? data.slice(startIndex, endIndex):0;
  // const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
  // const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const handlePageChange = (newPage: number) => {
    //console.log('en handlePageChange newPage,totalPages',newPage,totalPages, currentPage);
    if (newPage >= 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const handleRowSelection = (row: T) => {
    // console.log('en CustomGrid handleRowSelection',title,row,selectable);
    setSelectedGridRow(row);
    if (onRowSelect) {
      onRowSelect(row); // 📌 Notificar al componente padre
    }
  };
  // Función para actualizar el ancho de una columna globalmente
  const updateColumnWidth = (colKey: string, newWidth: string) => {
    setColumnWidths(prevWidths => {
      if (parseInt(prevWidths[colKey] || "150", 10) < parseInt(newWidth, 10)) {
        return { ...prevWidths, [colKey]: newWidth };
      }
      return prevWidths;
    });
  };
  const handleExport  = (fileName: string) => {
    const renameKey = (array: any[], oldKey: string, newKey: string) => { //para renombrar NumActividad por N° Actividad
      return array.map(obj => {
        if (!(oldKey in obj)) return obj; // Si la clave no existe, no modifica el objeto
        const { [oldKey]: value, ...rest } = obj;
        return { [newKey]: value, ...rest };
      });
    };
    const updatedColumns = columns.map(col => ({
      ...col, // Mantener los demás atributos sin cambios
      key: col.key === "NumActividad" ? "Nro Actividad" : col.key, 
      label: col.key === "NumActividad" ? "Nro Actividad" : col.label // Cambiar valores específicos
    }));
  const updatedData = renameKey(data, "NumActividad", "Nro Actividad");
  exportToExcel(fileName, updatedData, updatedColumns);
  };
  const filteredActions: ("edit" | "delete")[] = actions.filter((action): action is "edit" | "delete" => action !== "add");
  const minWidth = columns
  .filter((col) => col.visible !== false)
  .reduce((total, col) => total + parseInt(col.width || "100"), 0) + (actions.includes("edit") || actions.includes("delete") ? 100 : 0);

  const getEditableState = (column: ColumnConfigType<T>, row: T) => {
    if (isEditable) {
      return isEditable(column, row); // Usa la función si está definida
    }
    return column.editable; // Usa la configuración predeterminada si no hay función
  };
  return (
  <>
   {/* { console.log('JSX selectedRow',selectedRow)} */}
    <div
      style={{ marginBottom, width: gridWidth,  overflowX: "auto", fontSize,  }}
    >
      <div   /* Encabezado con título y botón Add */
        style={{  display: "flex",  gap: "10px", // Espaciado entre el título y el botón
          alignItems: "center", // Alineación vertical centrada
          marginBottom: "0rem",
          marginLeft:"2rem",
        }}
      >
        {title && <h2 style={{ fontWeight: "bold", marginTop: '0', fontSize,}}>{title}</h2>}
        {actions.includes("add") && (
          <CustomButton label={labelButtomActions[0]} onClick={ onAdd } buttonStyle="primary" size="small" theme="light"
            style={{ height: '2.00rem', marginTop:'0.3rem' }} icon={<FontAwesomeIcon icon={faPlus} />} tooltipContent={actionsTooltips[0] || 'Agregar'}
            tooltipPosition={actionsPositionTooltips[0] || 'bottom'}
          />
        )}        
        {exportable && <ExportConfig onExport={handleExport } />}
      </div>    
      <div style={{ border: `${borderWidth} solid ${borderColor}`, display: "inline-block", }}> 
        <GridHeader columns={columns} actions={filteredActions} borderColor={borderColor} borderWidth={borderWidth} padding={padding}
          borderVertical={borderVertical} columnWidths={columnWidths} fontSize={ fontSize}
        />
        <div>
          <div>
            { (paginatedData) ? paginatedData.map((row, rowIndex) => {/* Filas */
            // if (rowIndex < 3) console.log('row',row,rowIndex)
            return(
              <GridRow key={rowIndex} row={row} actions={filteredActions} onEdit={onEdit} onDelete={onDelete} rowHeight={rowHeight} fontSize={ fontSize}
                padding={padding} borderColor={borderColor} borderWidth={borderWidth} borderVertical={borderVertical}  actionsTooltips={actionsTooltips}
                actionsPositionTooltips={actionsPositionTooltips} columnWidths={columnWidths} // 📌 Pasamos el estado global de anchos
                updateColumnWidth={updateColumnWidth} selectable={selectable} onSelect={() => handleRowSelection(row)} isSelected={selectedGridRow === row}
                columns={columns.map((col) => ({...col, editable: getEditableState(col, row),}))} // 📌 Determina la edición dinámicamente       
                />
            )
            }): <></>}
          </div>
        </div>
      </div>
      { data && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", gap: "10px" }}>  {/* Controles de paginación */}
          <span> Página {currentPage+1 } de {totalPages}, son {data.length} filas   </span>
            {currentPage > 0 && (
                <CustomButton size='small'  buttonStyle="primary" theme="light" label="Pág. Anterior"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage >  totalPages - 1} 
                  icon={<FontAwesomeIcon icon={faArrowLeft} size="lg" color="white" />} iconPosition='left'
              />
            )}
              {currentPage < totalPages && (
              <CustomButton size='small'  buttonStyle="primary" theme="light" label="Pág. Siguiente"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1} 
                icon={<FontAwesomeIcon icon={faArrowRight} size="lg" color="white" />} iconPosition='right'
              />
            )}
        </div>
      )
      }
    </div>
  </>
 );
};