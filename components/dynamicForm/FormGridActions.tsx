import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

import { FormCustomTooltip } from './FormCustomToolTip';
import { useLabels } from '@/hooks/ohers/useLabels';


interface GridActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  label: string; //el de la grilla que se usa en los tooltips de las Action
  objectGrid?:string;
  actions: ('add' | 'edit' | 'delete')[];
}

const FormGridActions: React.FC<GridActionsProps> = ({ onEdit, onDelete, actions, label,objectGrid }) => {
  //console.log('label en GridActions',label)
  const { labels, error }         = useLabels();
  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="flex space-x-2">
      {  (actions?.includes('edit')) &&
      <FormCustomTooltip text={`${labels?.grid.tooltipsEdit} ${objectGrid}` }  color="white" backgroundColor="blue" position="top">
        <button type="button" onClick={onEdit} className="text-blue-500 hover:text-blue-700">
          <FaEdit />
        </button>
      </FormCustomTooltip>

      }
      {
      (actions?.includes('delete')) &&
      <FormCustomTooltip text={`${labels?.grid.tooltipsDelete} ${objectGrid}` }  color="white" backgroundColor="red" position="top">
        <button type="button" onClick={onDelete} className="text-red-500 hover:text-red-700">
          <FaTrashAlt />
        </button>
      </FormCustomTooltip>
      }
    </div>
  );
};

export default FormGridActions;
