
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
// Función para convertir fechas a `dayjs` y calcular diferencia en días, aceptar formato DD/MM/YYYY o DD-MM-YYYY
export const calculateDuration = (startDate: string, endDate: string): number | null => {
    // console.log('calculateDuration startDate,endDate',startDate,endDate);
    if (!startDate || !endDate) return null; // Si falta una fecha, no calcular
    let start = dayjs(startDate, ["DD/MM/YYYY"], true);
    let end = dayjs(endDate, ["DD/MM/YYYY"], true);
    if (startDate.includes('-')){
      start = dayjs(startDate, ["DD-MM-YYYY"], true);
      end = dayjs(endDate, ["DD-MM-YYYY"], true);
    }
    if (!start.isValid() || !end.isValid()) return null; // Validar fechas
    //console.log(end.diff(start, "day"));
    return end.diff(start, "day"); // Diferencia en días
  };