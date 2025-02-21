import {  useField } from 'formik';
import './CustomInput.css';
import { CustomTooltip } from './CustomTooltip';

export interface InputProps   { //extends Partial<FieldProps>
    /**
      * caption to display
    */
    label:string;
    /**
      * caption position
    */    
    captionPosition?: 'left' | 'top';
    /**
      * placeholder
    */   
    placeholder?: string;
    /**
      * type input
    */  
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'color' | "file";
    /**
      * value para storybook
    */      
    value?: string | number; // Para Storybook
    /**
      * error para storybook
    */     
    error?: string; // Para Storybook
    /**
      * text align
    */         
    textAlign?: 'left' | 'center' | 'right';
    /**
      * disabled
    */         
    disabled?: boolean;
    /**
      * required 
    */     
    required?: boolean;
    /**
      * maxlength
    */         
    maxLength?: number;
    /**
      * minLength
    */
    name?: string; // Nombre del campo en Formik         
    minLength?: number;
    pattern?: string;
    className?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; // Declarar onChange como opcional
    autoFocus?: boolean;
    /**
      * ícono at left
    */         
    leftIcon?: React.ReactNode;
    /**
      * ícono at right
    */         
    rightIcon?: React.ReactNode;
    /**
      * width control in pixels
    */     
    style?: React.CSSProperties; // Define el estilo inline del componente no va si es parte de un FormRow en que respeta grid-template-columns
    width?: string ; 
    theme?: 'light' | 'dark'; 
    /**
     * Contenido del tooltip
     */ 
    tooltipContent?: React.ReactNode;
    /**
     * Posición del tooltip
     */ 
    tooltipPosition?: "top" | "bottom" | "left" | "right"; 
    id?: string;
    min?:number; //valor mínimo si es number
}

export const CustomTextArea = ({
    // field,
    // form,
   
    label, captionPosition ='top',
    placeholder,
    type = 'text',
    
    value,
    textAlign='left',
    disabled = false,
    required = false,
    error,
    maxLength,
    minLength,
    style,
    width,
    pattern,
    onChange,
    autoFocus = false,
    leftIcon,
    rightIcon,
    theme='light',
    tooltipContent,
    tooltipPosition = "top",
    id,
    min=0,
    ...props
   }: InputProps ) =>{
    const inputClassNames = ` 
    custom-input-field ${theme}
    ${leftIcon ? 'has-left-icon' : ''} 
    ${rightIcon ? 'has-right-icon' : ''}
  `.trim();
    //const inputValue = field?.value ?? value; // Prioriza Formik si existe
    const [field, meta] = useField(props);
    const inputStyles = {
        backgroundColor: theme === 'dark' ? '#2d3748' : '#edf2f7',
        color: theme === 'dark' ? '#f7fafc' : '#1a202c',
        borderColor: theme === 'dark' ? '#4a5568' : '#cbd5e0',
        padding: '10px',
        borderRadius: '4px',
        width: '100%',
      };

    const inputValue = (field?.value ?? value)? field?.value ?? value:'';
    const name = field?.name || ''; // Usa un valor predeterminado si field es undefined
    // const errorMessage =
    //  (form?.touched?.[name] && form?.errors?.[name] && typeof form?.errors?.[name] === 'string') || error; // Prioriza Formik si existe
    const handleChange = field?.onChange || onChange; // Prioriza field.onChange si existe
    //console.log(' CustomInput ',name, value,label,id);
    const inputElement = (
      <div 
      className="input-wrapper"  
      >
        {leftIcon && <span className="icon left-icon">{leftIcon}</span>}
        <>
            <label htmlFor={ props.name}>{label}</label>
            <textarea className="textarea-input" {...field} {...props} style={inputStyles} />
            {meta.touched && meta.error ? (
                <div className="error-message">{meta.error}</div>
            ) : null}
            </>
        {/* <input
          id={id}
          {...field} // Solo contiene value, onChange, onBlur, y name
          {...props}
          type={type}
          className={inputClassNames}
          style={{ textAlign,
            ...style, // Combina estilos externos
            width: width || "auto", // Usa un ancho personalizado o predeterminado
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          value={inputValue} // Usamos inputValue que prioriza Formik
          onChange={handleChange} // Usa handleChange que prioriza field.onChange
          autoFocus={autoFocus}
        /> */}
        {rightIcon && <span className="icon right-icon">{rightIcon}</span>}
      </div>
    ); 
    //console.log('CustomInput tooltipPosition- toolTipsContent',tooltipPosition,tooltipContent);
    return (
      <div 
        className={`custom-input-container ${theme} ${captionPosition}`}
      >
        <label className={`custom-input-label ${captionPosition}`}
          style={{ marginBottom: captionPosition === "top" ? "0.5rem" : "0" }}
        >
          {label} {required && '*'}
        </label>
        {tooltipContent ? (
          <CustomTooltip content={tooltipContent} position={tooltipPosition} theme={theme} offset={1}>
            {inputElement}
          </CustomTooltip>
        ) : (
          inputElement
        )}
           {/* {errorMessage && <div className="error-message">{errorMessage}</div>} */}
        </div>
      );
}