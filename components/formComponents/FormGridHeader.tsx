import React from 'react';
import { GridColumnType, GridRowType } from '@/types/interfaces';

interface GridHeaderProps {
  columns: GridColumnType[];
  columnWidths?: string[];
  actions: ('add' | 'edit' | 'delete')[];
  label: string;
}

const FormGridHeader: React.FC<GridHeaderProps> = ({ columns, columnWidths = [], actions, label }) => {
  //console.log('en GridHeader', actions )
  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return str; // Retorna el string tal cual si está vacío o es undefined
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  return (
    <thead>
      <tr>
        {columns?.map((column: GridColumnType, index: number) =>
          column.visible ? (
            <th
              key={index}
              className={`px-4 py-2 ${columnWidths ? columnWidths[index] || 'w-auto' : 'w-auto'} text-${column.textAlign || 'left'} border-b`}
            >
              {capitalizeFirstLetter((column.label)?column.label:column.name) }
            </th>
          ) : null
        )}
        {actions && actions.length > 0 && <th>Actions</th>}
      </tr>
    </thead>
  );
};
export default FormGridHeader;
