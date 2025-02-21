import { GridRow } from "@/types/interfaces";

 
  // Función para convertir JSON en GridRow[]
export const transformToGridRows = (data: any[]): GridRow[] => {
    //console.log('en transformToGridRows data',data);
    return data.map((row, index) => {
      const transformedRow: GridRow = {};
  
      Object.keys(row).forEach((key) => {
        let value = row[key];
  
        // Convertir valores nulos o indefinidos a ""
        if (value === null || value === undefined) {
          value = "";
        }
  
        // Convertir booleanos si es posible
        if (typeof value === "string") {
          const lowerValue = value.trim().toLowerCase();
          if (lowerValue === "true" || lowerValue === "false") {
            value = lowerValue === "true";
          } else if (!isNaN(Number(value))) {
            // Convertir a número si es válido
            value = Number(value);
          }
        }
  
        // Asignar el valor transformado
        transformedRow[key] = value;
      });
  
      return transformedRow;
    });
  };
  