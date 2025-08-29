import React, { useState, useMemo, useEffect } from 'react';
import { useField } from 'formik';

import './CustomSelect.css';
type Option = { value: string | number; label: string };
// export interface CustomSelectProps {
//   /**
//     * caption to display
//   */
//   label: string;
//   /**
//     * value selected
//   */  
//   name?: string; // Nombre del campo en Formik
//   /**
//     * options
//   */  
//   options: { value: string | number ; label: string }[];
//   /**
//     * selected value without formik
//   */  
//   value?: string | string[]; // Puede ser string o array de strings si es múltiple es un array de los
//   style?: React.CSSProperties;
//   maxHeight?: string;
//   overflowY?: 'auto' | 'scroll' | 'hidden' | 'visible';
//   width?: string ; 
//   //onChange?: (value: string | string[]) => void; // Acepta string o array de strings
//   onValueChange?: (value: string | string[]) => void;
//   placeholder?: string;
//   required?: boolean;
//   theme?: 'light' | 'dark';
//   multiple?: boolean;
//   captionPosition?: 'top' | 'left';
//   id?: string;
//   enabled?:boolean;
//   visible?:boolean;
//   // dependentValue?: any;//dato para select anidado
// }

type CommonProps = {
  label: string;
  name?: string;
  options: Option[];
  style?: React.CSSProperties;
  maxHeight?: string;
  overflowY?: 'auto' | 'scroll' | 'hidden' | 'visible';
  width?: string;
  placeholder?: string;
  required?: boolean;
  theme?: 'light' | 'dark';
  captionPosition?: 'top' | 'left';
  id?: string;
  enabled?: boolean;
  visible?: boolean;
};

type SingleProps = CommonProps & {
  multiple?: false;
  value?: string | number;
  onValueChange?: (value: string | number) => void;
};

type MultiProps = CommonProps & {
  multiple: true;
  value?: Array<string | number>;
  onValueChange?: (value: Array<string | number>) => void;
};
export type CustomSelectProps = SingleProps | MultiProps;
export type CustomSelectWithFormikProps = SingleProps | MultiProps;

export const CustomSelect: React.FC<CustomSelectProps> = (props) => {
  
  if (props.name) {
    return <CustomSelectWithFormik {...(props as Required<CustomSelectProps>)} />;
  } else {
    return <CustomSelectStandalone {...props} />;
  }
};
  export const CustomSelectWithFormik: React.FC<CustomSelectWithFormikProps> = (props) => {
    const {
      label, name, options,
      placeholder = 'Seleccione una opción',
      style, maxHeight='150px', overflowY='auto', width='100%',
      required=false, theme='light', captionPosition='top', id,
      enabled=true, visible=true,
    } = props; // ⚠️ OJO: NO extraigas props.multiple ni props.onValueChange aquí
   // 1) Derivar el valor externo normalizado a string(s)
   const selectedFromProps = useMemo(() => {
    if (props.multiple) {
      const vals = (props.value ?? []) as Array<string | number>;
      return vals.map(String);
    }
    const v = (props.value ?? '') as string | number;
    return String(v);
  }, [props]);
   // 2) Estado interno inicial (usa selectedFromProps)
   const [selectedInside, setSelectedInside] = useState<string | string[]>(
      props.multiple
        ? (selectedFromProps as string[])
        : (selectedFromProps as string)
    );
    // 3) Sincronización si cambia el value externo
    useEffect(() => {
      setSelectedInside(
        props.multiple
          ? (selectedFromProps as string[])
          : (selectedFromProps as string)
      );
    }, [selectedFromProps, props.multiple]);
  const [field, , helpers] = useField<string | string[]>(name);
  // const selectedValue = useMemo(() => field.value ?? (multiple ? [] : ''), [field.value, multiple]);
  // const formikValue = field.value;


  if (!visible) return null;
  
  const setFormik = (val: string | string[]) => {
    helpers.setValue(val);         // ✅ aquí el cambio
    helpers.setTouched(true, false);
  };

  const handleCheckboxChange = (checkedValue: string | number) => {
    console.log('en handleCheckboxChange checkedValue',checkedValue)
    if (!props.multiple) return; // narrow a MultiProps
    const current = Array.isArray(selectedInside) ? selectedInside : [];
    const s = String(checkedValue);
    const updated = current.includes(s) ? current.filter(v => v !== s) : [...current, s];

    setFormik(updated);
    // ahora TS sabe que onValueChange es (arr) => void
    props.onValueChange?.(updated as Array<string | number>);
    setSelectedInside(updated);
  };

  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (props.multiple) return; // narrow a SingleProps
    const newStr = e.target.value;

    setFormik(newStr);
    // preserva número si tu value u option es numérico
    const isNum =
      typeof (props.value as any) === 'number' ||
      typeof options.find(o => String(o.value) === newStr)?.value === 'number';
    props.onValueChange?.(isNum ? Number(newStr) : newStr);
    setSelectedInside(newStr);
  };
  return (
    <div className={`custom-select-container ${theme} ${captionPosition}`}>
      <label className={`custom-select-label ${captionPosition}`} style={style}>
        {label} {required && '*'}
      </label>

      {props.multiple ? (
        <div className="custom-multiple-select" style={{ ...style, width, ...(maxHeight ? { maxHeight } : {}), ...(overflowY ? { overflowY } : {}) }}>
          {options.map((option) => 
            {
              const valStr = String(option.value);
              const checked = Array.isArray(selectedInside) && selectedInside.includes(valStr);
              return(
                <label key={option.value} className="custom-option">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCheckboxChange(option.value)}
                    disabled={!enabled}
                  />
                  {option.label}
                </label>
              )
            })}
        </div>
      ) : (
        <select
          {...field}
          id={id}
          name={name}
          value={selectedInside as string}
          onChange={handleSelectChange}
          className="custom-select"
          style={{ ...style, width }}
          disabled={!enabled}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export const CustomSelectStandalone: React.FC<CustomSelectProps> = (props) => {
    const {
      label,
      name,
      options,
      placeholder = 'Seleccione una opción',
      style,
      maxHeight = '150px',
      overflowY = 'auto',
      width = '100%',
      required = false,
      theme = 'light',
      multiple = false,
      captionPosition = 'top',
      id,
      enabled = true,
      visible = true,
    } = props;
    const optionMap = useMemo(() => {
      const m = new Map<string, Option>();
      for (const o of options) m.set(String(o.value), o);
      return m;
    }, [options]);
      // ---------- Estado controlado (normalizado a strings) ----------
      const selectedFromProps = useMemo(() => {
        if (multiple) {
          const vals = ((props as MultiProps).value ?? []) as Array<string | number>;
          return vals.map(String);
        } else {
          const v = (props as SingleProps).value ?? '';
          return String(v);
        }
      }, [props, multiple]);
      const [selectedInside, setSelectedInside] = useState<string | string[]>(
        props.multiple
          ? (selectedFromProps as string[])
          : (selectedFromProps as string)
      );
      // 3) Sincronización si cambia el value externo
      useEffect(() => {
        setSelectedInside(
          props.multiple
            ? (selectedFromProps as string[])
            : (selectedFromProps as string)
        );
      }, [selectedFromProps, props.multiple]);
      
    if (!visible) return null;
    // ---------- Helpers de coerción ----------
  
    const coerceOutSingle = (s: string): string | number => {
      // Si props.value es number, o el option es number, devolvemos number
      const currentVal = (props as SingleProps).value;
      if (typeof currentVal === 'number') return Number(s);
      const opt = optionMap.get(s);
      if (opt && typeof opt.value === 'number') return Number(s);
      return s;
    };
    const coerceOutArray = (arr: string[]): Array<string | number> => {
      const current = (props as MultiProps).value;
      const expectNumber =
        Array.isArray(current) && current.some((v) => typeof v === 'number')
          ? true
          : // o si TODOS los options marcados son numéricos
            arr.length > 0 && arr.every((v) => typeof optionMap.get(v)?.value === 'number');
  
      return expectNumber ? arr.map((v) => Number(v)) : arr;
    };
  const handleCheckboxChange = (checkedValue: string | number) => {
    if (!multiple) return; // seguridad
    const current = Array.isArray(selectedInside) ? selectedInside : [];
    // const current = Array.isArray(selectedInside) ? selectedInside : [];
    const s = String(checkedValue);
    const updatedStrings = current.includes(s) ? current.filter((v) => v !== s) : [...current, s];

    setSelectedInside(updatedStrings);
    const cb = props.onValueChange as ((v: Array<string | number>) => void) | undefined;
    cb?.(coerceOutArray(updatedStrings));
  };
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (multiple) return; // seguridad
    const newString = event.target.value;
    setSelectedInside(newString);
    const cb = props.onValueChange as ((v: string | number) => void) | undefined;
    cb?.(coerceOutSingle(newString));
  };
  
  return (
    <div className={`custom-select-container ${theme} ${captionPosition}`}>
      <label className={`custom-select-label ${captionPosition}`}>
        {label} {required && '*'}
      </label>
      {multiple ? (
        <div className="custom-multiple-select" 
                style={{
          ...style,
          width,
          ...(maxHeight ? { maxHeight } : {}),
          ...(overflowY ? { overflowY } : {}),
        }}
        >
        {options.map((option) => {
            const valStr = String(option.value);
            const checked =
              Array.isArray(selectedInside) && selectedInside.includes(valStr);

            return (
              <label key={valStr} className="custom-option">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxChange(option.value)}
                  disabled={!enabled}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      ) : (
        <select
          id={id}
          name={name}
          value={(selectedInside as string) ?? ''}
          onChange={handleSelectChange}
          className="custom-select"
          style={{ ...style, width }}
          disabled={!enabled}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
