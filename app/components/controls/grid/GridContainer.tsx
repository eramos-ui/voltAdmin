import React from 'react';
import { GridColumn, GridRow, FormConfig } from '../../../../types/interfaces';
//import GridHeader from './GridHeader';
//import GridRowComponent from './GridRowComponent';

interface GridContainerProps {
  columns: GridColumn[];
  rows: GridRow[];
  actions: ('add' | 'edit' | 'delete')[];
  onEdit: (index: number, editFormConfig?: FormConfig) => void; // Pasamos el editFormConfig aquí
  onDelete: (index: number) => void;
  columnWidths?: string[];
  editFormConfig?: FormConfig; // Agregar editFormConfig como prop
  label: string; //para los tooltips
  objectGrid?:string;//para el tooltips de los botones de actions
}

const GridContainer: React.FC<GridContainerProps> = ({ columns, rows, actions, onEdit, onDelete, columnWidths, editFormConfig, label, objectGrid }) => {
    //console.log('en GridContainer rows ***************',rows)
    return (
    <table className="min-w-full border-collapse">
      {/* <GridHeader columns={columns} columnWidths={columnWidths} actions={actions} label={label} />
      <tbody>
        {rows.map((row: GridRow, rowIndex: number) => (
          <GridRowComponent
            key={rowIndex}
            row={row}
            columns={columns}
            columnWidths={columnWidths}
            actions={actions}
            onEdit={() => onEdit(rowIndex, editFormConfig)} // Pasamos el editFormConfig en el evento de edición
            onDelete={() => onDelete(rowIndex)}
            label={label}
            objectGrid={objectGrid}//para el tooltips de los botones de actions
          />
        ))}
      </tbody> */}
    </table>
  );
};

export default GridContainer;
