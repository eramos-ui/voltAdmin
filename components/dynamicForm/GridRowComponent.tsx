//import { GridColumnType, GridRowType } from '@/types/interfaces';
import { formatRut } from '@/utils/formatRut';
import { formatMoney } from '@/utils/formatMoney';
import {formatSIN}  from '@/utils/formatSIN';
import FormGridActions from './FormGridActions';
import { GridColumnDFType, GridRowDFType } from '@/types/interfaceDF';


interface GridRowProps {
  row: GridRowDFType;
  columns: GridColumnDFType[];
  columnWidths?: string[];
  onEdit: () => void;
  onDelete: () => void;
  label:string;
  objectGrid?:string;//para el tooltips de los botones de actions
  actions: ('add' | 'edit' | 'delete')[];
}

const GridRowComponent: React.FC<GridRowProps> = ({ row, columns , actions, objectGrid, columnWidths = [], onEdit, onDelete, label }) => {
  //console.log('en GridRowComponent', actions )
  const renderCellValue = (column: GridColumnDFType, value: any) => {
    switch (column.typeColumn?.toLowerCase()) {
      case 'rut':
        return formatRut(value as string); // Formatea el RUT
      case 'sin': 
        return formatSIN(value as string); // Formatea el SIN
      case 'money':
        return formatMoney(value as number); // Formatea valores monetarios
      case 'number':
        return value?.toString(); // Convierte un número a string si es necesario
      case 'boolean':
        return value ? 'Sí' : 'No'; // Manejo de valores booleanos

      case 'date':
        return new Date(value as string).toLocaleDateString(); // Manejo de fechas

      default:
        return value; // Valor por defecto si no hay coincidencia con los tipos
    }
  };
  return (
    <tr className="border-t" style={{ height: '40px' }}>
      {columns?.map((column: GridColumnDFType, colIndex: number) => 
        column.visible ? (
          <td
            key={colIndex}
            className="px-4 py-2 whitespace-nowrap"
            style={{ width: columnWidths ? columnWidths[colIndex] : 'auto', textAlign: column.textAlign }}
          >
          {renderCellValue(column, row[column.name.toLowerCase()])}
          </td>
        ) : null
      )}
      <td>
         <FormGridActions onEdit={onEdit} onDelete={onDelete} label={label} objectGrid={objectGrid} actions={actions} />
      </td>
    </tr>
  );
};

export default GridRowComponent;
