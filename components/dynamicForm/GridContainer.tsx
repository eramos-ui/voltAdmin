import React from 'react';
import FormGridHeader from './FormGridHeader';

import GridRowComponent from './GridRowComponent';
import { FormConfigDFType, FormFieldDFType, GridColumnDFType, GridRowDFType } from '@/types/interfaceDF';
import { TitleOverGridAndAddButton } from './TitleOverGridAndAddButton';


interface GridContainerProps {
  columns: GridColumnDFType[];
  rows: GridRowDFType[];
  actions: ('add' | 'edit' | 'delete')[];
  onEdit: (index: number, editFormConfig?: FormConfigDFType) => void; // Pasamos el editFormConfig aquí
  onDelete: (index: number) => void;
  columnWidths?: string[];
  editFormConfig?: FormConfigDFType; // Agregar editFormConfig como prop
  label: string; //para los tooltips
  objectGrid?:string;//para el tooltips de los botones de actions
  handleAdd:() => void;//botón de agregar
  table:FormFieldDFType;
}

const GridContainer: React.FC<GridContainerProps> = ({ columns, rows, actions, onEdit, 
    onDelete, columnWidths, editFormConfig, label, objectGrid, handleAdd, table }) => {
      
    // console.log('en GridContainer table',table)
    return (
     <>
      <TitleOverGridAndAddButton table={table} actions={actions} handleAdd={handleAdd} />
      <table className="min-w-full border-collapse">
        <FormGridHeader 
        columns={columns} columnWidths={columnWidths} actions={actions} label={label} 
        />
        <tbody>
          {rows.map((row: GridRowDFType, rowIndex: number) => (
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
        </tbody>
      </table>
     
     </> 
  );
};

export default GridContainer;
