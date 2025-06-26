import {  ValidationRule } from "./interfaces";

export type InputDFType = 'text' |'input' | 'email' | 'select' | 'password' | 'date' |'textarea' 
        | 'number' | 'file' | 'grid' | 'multiselect'| 'autocomplete' | 'RUT' |'sin' ;
export interface ButtonConfigDFType {
    id: string;
    text: string;
    action: string;
    backgroundColor: string;
    color: string;
    padding: string;
    borderRadius: string;
    marginRight?: string;
  }
  export interface GridRowDFType {//las filas del Dynamic form-grilla
    [key: string]: string | number  | boolean ;
  } 
   type ValidationDFType = 'required' | 'maxLength' | 'minLength' | 'email' | 'minDate' | 'maxDate' | 'min' |'max' |'url' |'pattern'|'rut' |'pattern'
      |'select' | 'valueGreaterThanZero';
   interface ValidationDFRule {
    type: ValidationDFType;
    value?: number | string | RegExp | string[];
    message?:string;
  }
  export interface FormFieldDFType { //los campos del formulario Dynamic
    type: InputDFType;
    name: string;
    label: string;
    autoComplete?:'on' |'off';
    placeholder?: string;
    visible?: boolean;
    value: string | number | boolean | undefined;
    row: number;
    width: string; 
    registroInicialSelect:string;//el registro que aparece en 1er lugar
    options?: { value: string | number; label: string }[];
    validations?: ValidationDFRule[];
    dependsOn?: string; // Nueva propiedad
    dependentOptions?: { [key: string]: { id: string | number; label: string }[] };
    format?: string;
    orientation?: 'horizontal' | 'vertical'; 
    min?: number; // Para el slider
    max?: number; // Para el slider
    step?: number; // Para el slider
    titleGrid?:string,
    labelGridAdd?: string;    
    spFetchRows?:string; //field con el sp que carga la tabla
    apiGetRows?:string; //field con el api que carga la tabla desde MongoDB
    objectGrid?:string;//para el tooltips de agregar y eliminar
    columns?: GridColumnDFType[];// Para el grid
    rows?: GridRowDFType[]; // Para el grid
    actions?: ('add' | 'edit' | 'delete')[]; // Para el grid
    rowHeight?: string; // Altura de las filas
    columnWidths?: string[]; // Anchos de las columnas para el grid
    gridWidth?:string;//ancho total grilla 
    editFormConfig?: FormConfigDFType; // Para el formulario de edición
    className?: string;  // Para clases CSS personalizadas
    style?: React.CSSProperties;  // Para estilos en línea
    inputProps?: { [key: string]: any }; // Atributos HTML adicionales
    formatOptions?: { [key: string]: any }; // Opciones de formato adicionales
    conditionalStyles?: { [key: string]: React.CSSProperties }; // Estilos condicionales
    dependentValue?:any;
    requiredIf?:{field:string,equal:string};
    spFetchOptions?: string;
    apiOptions?: string;
    spFetchSaveGrid?:string;
    apiSaveForm?:string;
    requirePassword?:boolean; 
    padding?:string;
    marginBottom?:string;
    borderColor?:string;
    borderWidth?:string;
  }
  export interface ModalStylesDFType {
    overlay?: React.CSSProperties;
    content?: React.CSSProperties;
    header?: React.CSSProperties;
    modalTitleStyle?: React.CSSProperties; 
  }
export interface FormConfigDFType { //del formulario dynamic
    formTitle: string;
    theme?: string;
    globalStyles?: {
      light?: React.CSSProperties;
      dark?: React.CSSProperties;
    };
    preferredTheme?:string;
    formSize?: {
      width?: string;
      maxWidth?: string;
    };
    buttons: ButtonConfigDFType[];
    table: FormFieldDFType;
    editFields?: FormFieldDFType[];
    rows?:GridRowDFType[];
    modalStyles?: ModalStylesDFType;
    requirePassword?:boolean;
    editFormConfig?: {
      formTitle: string;
      requirePassword:boolean;
      modalStyles?: ModalStylesDFType;
      fields: FormFieldDFType[];
    }; // Incluimos editFormConfig como opcional
  }
  export type ColumnConfigDFType<T>= {// Tipo para configuración de las columnas de la grilla <T> es por genérico
    label: string; // Título de la columna
    key: keyof T; // Clave del dato en cada fila (debe existir en T)
    visible?: boolean; // Si la columna es visible
    type?: "string" | "number"; // Tipo de dato de la columna
    textAlign?: "left" | "center" | "right"; // Alineación del texto
    width?: string; // Ancho de la columna (por ejemplo, "150px")
    widthFormEdit?:string;//el ancho en el modal
    rowFormEdit?:number;//la fila del modal
    labelFormEdit?:string; //label en el modal
    styles?: React.CSSProperties; // Estilos adicionales para la columna
    captionPosition: "left" | "top", 
    inputType?: string,
    options?: { value: string; label: string }[];// Opciones para selects
    validationSchema?: any;
    editable?:boolean,
    row?:number;
    dependsOn?: { field: string, value: string },
    //dependencies?:{ field: string; valueMap: Record<string, any> }[];
    required?:boolean;
  };
  export interface GridColumnDFType {
    name: string;
    visible: boolean;
    textAlign?: 'left' | 'center' | 'right';
    typeColumn?:'number'|'string'|'rut'|'money'|'sin'|'boolean'|'file' | 'date';
    //string | number | boolean | Date | null | File | undefined;
    label?:string;
    unique?: boolean;
    dependentValue?:{field:string,value:string};    
  }
  export interface FormValuesDFType {
    [key: string]: string | number | boolean| Date | File | undefined | null;
  }

//string | number | boolean | Date | null | File | undefined;