import { FormField } from "@/types/interfaces"; 
import { MyAutocomplete, MyCheckbox, MyDate, CustomFileInput, MyGrid, MyMultiSelect, MyNumberInput, MyRadioGroup, MySINInput,
      MyRangeInput, MyReadOnlyText, MyRUTInput, MySelect, MySlider, MyTextarea, MyTextInput, MyToggleSwitch } from "./controls";
import { fetchOptionsFromDatabase } from '../utils/fetchOptionsFromDatabase';

//Este componente distribuye sobre los diferentes custom control del formulario dinámico
export const FieldComponent: React.FC<{ field: FormField,theme:string }> = ({ field, theme }) => {//theme es el del form (dark, light)
  //console.log('field',field);  
  const { type, label, name, placeholder, visible, autoComplete, options, width,  format, columns, rows, actions, 
     rowHeight, gridWidth, conditionalStyles, editFormConfig, columnWidths, spFetchOptions, registroInicialSelect, titleGrid, 
     labelGridAdd, dependentValue, spFetchRows, spFetchSaveGrid, objectGrid} = field;
    //console.log('FieldComponent spFetchRows',spFetchRows,spFetchSaveGrid)
    const tailwindWidth = width ? `w-${Math.round((parseFloat(width) / 100) * 12)}/12` : 'w-full';
    let selectOptions: { id: string | number; label: string }[] = options || [];
    // export type InputType = 'text' | 'input' | 'email' | 'select' | 'password' | 'date' | 'checkbox' |'textarea' | 'readonly'
    //     | 'number' | 'file' | 'radio' | 'slider' | 'range' |'toggle' | 'grid' | 'multiselect'| 'autocomplete' |'rut' |'sin';
    console.log('name-field',name,field)
    // let staticOptions:{ id: string | number; label: string }[];
    const dependentValues='';
    let staticOptions: { id: string | number; label: string }[] = options || [];
    switch (type) {
      case 'input':
      case 'text':
      case 'password':
      case 'email':
        return (<MyTextInput type={type === 'input' ? 'text' : type} name={name} label={label} placeholder={placeholder} 
           theme={theme} className="text-input" autoComplete={autoComplete} width={width} />);
      case 'readonly':
        return <MyReadOnlyText name={name} label={label} />;
      case 'select':
        return <MySelect label={label} name={name}  theme={theme} options={staticOptions} dependentValue={dependentValue} 
           className={`text-input w-[${field.width}]`} // Establecer ancho con Tailwind
           width= {field.width } // Esto es redundante con lo anterior
           spFetchOptions= {(spFetchOptions)? spFetchOptions:''} registroInicialSelect={registroInicialSelect}
        />;
      case 'multiselect':
        const multiSelectOptions = options?.map(option => ({ value: option.id, label: option.label })) || [];
        return <MyMultiSelect label={label} name={name} options={multiSelectOptions}  width={width}  />;
      case 'checkbox':
        return <MyCheckbox label={label} name={name} className="checkbox-input"  width={width}  />;
      case 'textarea':
        return <MyTextarea label={label} name={name} placeholder={placeholder}  theme={theme}  width={width} />;
      case 'number':
        return <MyNumberInput label={label} name={name} placeholder={placeholder}  theme={theme} visible={visible}  width={width}   />;
      case 'sin':
        return <MySINInput label={label} name={name} placeholder={placeholder} className="text-input"  theme={theme}  width={width} />;
      case 'rut':
        return <MyRUTInput className="text-input" autoComplete={autoComplete} 
          label={label} name={name} placeholder={placeholder} theme={theme} width={width} 
        />;
      case 'file':
        return <CustomFileInput label={label} name={name}  width={width}  accept={".img, .jpg, .png"}  />;
      case 'radio':
        return <MyRadioGroup label={label} name={name} options={selectOptions} orientation={field.orientation || 'vertical'}  width={width}  />;
      case 'slider':
        return <MySlider label={label} name={name} min={field.min!} max={field.max!} step={field.step!}   width={width} />;
      case 'range':
        return <MyRangeInput label={label} name={name} min={field.min!} max={field.max!} step={field.step!}  width={width}  />;
      case 'toggle':
        return <MyToggleSwitch label={label} name={name}  width={width} />;
      case 'date':
        return <MyDate label={label} name={name} placeholder={placeholder} format={format} theme={theme}  width={width}  />;
      case 'autocomplete':
        return <MyAutocomplete name={name} label={label} fetchOptions={fetchOptionsFromDatabase}  width={width} />;
      case 'grid':
        return (
          <MyGrid
            label={label}
            name={name}
            titleGrid={(titleGrid)?titleGrid:'Item'}
            labelGridAdd={(labelGridAdd)?labelGridAdd:'Agregar ítem'}
            objectGrid={(objectGrid)?objectGrid:'item' }
            allValues={dependentValues}
            spFetchRows={spFetchRows}
            spFetchSaveGrid={spFetchSaveGrid}
            columns={columns || []}
            rows={rows || []}
            actions={actions || []}
            columnWidths={columnWidths || []}
            rowHeight={rowHeight || '40px'}
            gridWidth={gridWidth || '100%'}
            editFormConfig={editFormConfig}
            field={field}
            width={width} 
          />
        );
      default:
        throw new Error(`El type: ${type} no es soportado`);
    }
  };