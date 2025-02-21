import { useEffect, useState } from "react";
import { Formik } from "formik";
import isEqual from "lodash/isEqual"; 
import * as Yup from "yup";
import { CustomInput } from "../components/controls/CustomInput";
import { CustomButton } from "../components/controls/CustomButton";
import { CustomSelect } from "../components/controls/CustomSelect";
import { CustomFileInput } from "../components/controls/CustomFileInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser, faFloppyDisk,} from '@fortawesome/free-solid-svg-icons';
import { CustomDate } from "./controls";
import { CustomSelectIcon } from "./controls/CustomSelectIcon";
import './DynamicForm.css';
const validInputTypes = ["text", "number", "email", "password", "url", "tel", "search", "color", "file"] as const;
type InputType = typeof validInputTypes[number];
// const isValidInputType = (type?: string): type is InputType => {
//     return validInputTypes.includes(type as InputType);
// };
export type ColumnDynamicForm = {
    field: string;
    headerName: string;
    editable?: boolean;
    inputType?: string;
    options?: { value: string; label: string , image?:string | undefined, nroAguas?:number,}[];
    validationSchema?: any;
    captionPosition?: "top" | "left";
    width?:string;
    row: number; // Nueva propiedad para agrupar por filas
    multiple?:boolean;
    dependsOn?: { field: string; value: string | number | boolean }; 
    dependencies?:{ field: string; valueMap: Record<string, any> }[];    
    required?:boolean;
  };

const DynamicForm = ({
    columns,
    initialValues,
    onSave,
    onCancel,
    rowIndex,
    handleFileUpload, 
    setIsDirty,
  }: {
    columns:ColumnDynamicForm[];    
    initialValues: any;
    onSave: (values: any, rowIndex?: number) => void;
    onCancel: () => void;
    //onChange: (values: any) => void;
    setIsDirty: (dirty: boolean) => void;
    rowIndex?:number;
    handleFileUpload?: (file: File | null, rowIndex?: number, field?: string) => void;
  }) => {
  //console.log('DynamicForm columns',columns);
  useEffect(() => {
    setIsDirty(false); // 📌 Inicializa como no modificado al cargar
  }, []);
  // Crear un esquema de validación dinámico
  const validationSchema = Yup.object(
    columns
      .filter((col) => col.editable && col.validationSchema)
      .reduce<Record<string, any>>((schema, col) => {
        schema[col.field] = col.validationSchema;
        return schema;
      }, {})
  );
    // 📌 Agrupar los campos por fila (`row`)
  const groupedColumns = columns.reduce<Record<number, ColumnDynamicForm[]>>((acc, col) => {
      if (!acc[col.row]) acc[col.row] = [];
      acc[col.row].push(col);
      return acc;
   }, {});
  //console.log('groupedColumns',groupedColumns);
  const handleFieldChange = (field: string, newValue: string, setFieldValue:any) => {
     setFieldValue(field, newValue);
    const columnWithDependencies = columns.find((col) => col.field === field);// 📌 Busca si hay dependencias configuradas para este campo
    if (columnWithDependencies?.dependencies) {
        //console.log('dependencies',columnWithDependencies?.dependencies);
       columnWithDependencies.dependencies.forEach(({ field: dependentField, valueMap }) => {
         if (valueMap[newValue] !== undefined) {
          setFieldValue(dependentField, valueMap[newValue]);
         }
       });
     }
  };
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
          //console.log("🔄 Enviando valores editados:", values);
          onSave(values);
          setIsDirty(false);
          setSubmitting(false);
      }}
    >
     {({ handleSubmit, handleChange, setFieldValue, values }) => {
        // 📌 Detectar si los valores han cambiado respecto a los iniciales
       useEffect(() => {
          const dirty = !isEqual(values, initialValues); // 📌 Comparar valores con lodash
          setIsDirty(dirty);
       }, [values, initialValues]);
       return (
          <div className="dynamic-form">
              {Object.entries(groupedColumns).map(([rowNumber, rowColumns]) => (
                  <div key={rowNumber} className="dynamic-form-row">
                      {rowColumns.filter((col) => col.editable).map((col) => {
                          const isDisabled = col.dependsOn
                              ? values[col.dependsOn.field] == null || values[col.dependsOn.field] !== col.dependsOn.value
                              : false;
                          return (
                              <div key={col.field} className="dynamic-form-field">
                                  {col.inputType === "file" ? (
                                      <CustomFileInput
                                          id={col.field}
                                          name={col.field}
                                          label={col.headerName}
                                          width={col.width}
                                          accept=".pdf, .jpg"
                                          putFilenameInMessage={true}
                                          value={values[col.field]}
                                          onUploadSuccess={(file: File | null) => {
                                              if (file) {
                                                  console.log(`📂 Archivo subido (${col.field}):`, file.name);
                                                  setFieldValue(col.field, file.name);
                                                  handleFileUpload?.(file, rowIndex, col.field);
                                              }
                                          }}
                                      />
                                  ) : col.inputType === "date" ? (
                                      <CustomDate label={col.headerName} name={col.field} theme="light" width="80px" />
                                  ) : col.inputType === "select" && col.options ? (
                                      <CustomSelect
                                          id={col.field}
                                          name={col.field}
                                          label={col.headerName}
                                          options={col.options}
                                          value={values[col.field]}
                                          multiple={col.multiple}
                                          onChange={(value) => handleChange({ target: { name: col.field, value } })}
                                          captionPosition={col.captionPosition || "top"}
                                          theme="light"
                                          width={col.width}
                                      />
                                  ) : col.inputType === "selectIcon" && col.options ? (
                                      <CustomSelectIcon
                                          name={col.field}
                                          label="Selecciona la forma del techo"
                                          options={col.options}
                                          value={values[col.field]}
                                          width={col.width}
                                          onChange={(value) => {
                                              setFieldValue(col.field, value);
                                              if (col.dependsOn) {
                                                  setFieldValue(col.dependsOn.field, value);
                                              }
                                              //console.log(`📌 Actualizando ${col.field} -> ${value}`);
                                              handleFieldChange(col.field, value, setFieldValue);
                                          }}
                                      />
                                  ) : (
                                      <CustomInput
                                          id={col.field}
                                          label={col.headerName}
                                          width={col.width}
                                          style={{ width: "100%" }}
                                          value={values[col.field]}
                                          placeholder={`Ingrese ${col.headerName.toLowerCase()}`}
                                          onChange={handleChange}
                                          type={col.inputType && validInputTypes.includes(col.inputType as InputType) ? (col.inputType as InputType) : "text"}
                                          captionPosition={col.captionPosition || "top"}
                                          theme="light"
                                          disabled={isDisabled}
                                      />
                                  )}
                              </div>
                          );
                      })}
                  </div>
              ))}
              <div className="dynamic-form-actions">
                  <CustomButton 
                      buttonStyle="secondary" 
                      size="small" 
                      htmlType="button" 
                      label="Cancelar" 
                      tooltipPosition="left" 
                      onClick={onCancel} 
                      icon={<FontAwesomeIcon icon={faEraser} size="lg" color="white" />}  
                      tooltipContent="Para salir del formulario sin actualizar"                   
                  />
                  <CustomButton 
                      buttonStyle="primary"  
                      size="small" 
                      onClick={() => handleSubmit()} // 🔹 Se llama manualmente a `handleSubmit`
                      label="Guardar"
                      style={{ marginRight: "25px" }} 
                      tooltipPosition="left"     
                      icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} 
                      tooltipContent="Para actualizar la grilla"                 
                  />
              </div>
          </div>
       );
     }}
    </Formik>
  );
};
export default DynamicForm;