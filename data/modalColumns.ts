import { ColumnConfig, GridRowType } from "@/types/interfaces";
import { optionsCeilingElementType, optionsMaterialCielingType, optionsOrientation, techoOptions } from "./selectType";
import { ColumnDynamicForm } from "@/app/components/DynamicForm";

export const techoColumns: ColumnConfig<GridRowType>[] = [
    { key: "nroInstalacion", label: "Nro Instalación", captionPosition: "top", editable: false, type: "string", options: undefined },
    { key: "nroAgua", label: "Nro Agua", captionPosition: "top", editable: false, type: "string", options: undefined },
    { key: "orientacion", label: "Orientación", captionPosition: "top", editable: true, type: "string",inputType:"select", options: optionsOrientation,
        widthFormEdit:'180px',rowFormEdit:1, },
    { key: "material", label: "Material del Techo", captionPosition: "top", editable: true, type: "string",inputType:"select", options: optionsMaterialCielingType, 
        widthFormEdit:'180px',rowFormEdit:1, },
    { key: "area", label: "Área (m²)", captionPosition: "top", editable: true, type: "number", options: undefined , widthFormEdit:'120px',rowFormEdit:1,}, 
    { key: "pendiente", label: "Pendiente (grados)", captionPosition: "top", editable: true, type: "number", options: undefined, widthFormEdit:'120px',rowFormEdit:1, },
    { key: "otrosElementos", label: "Elementos en techo", captionPosition: "top", editable: true, type: "string",inputType:"select", options: optionsCeilingElementType,
        widthFormEdit:'200px',rowFormEdit:2,},
    { key: "imagenTecho", label: "Imagen agua (pdf/jpg)", captionPosition: "top", editable: true, type:"string", inputType: "file", width: '250px',rowFormEdit:2,  },
  ];

  export const techoColumnsDynamic: ColumnDynamicForm[] = techoColumns.map(col => ({
    field: String(col.key), // `key` se convierte en `field`
    headerName:  (col.labelFormEdit)?col.labelFormEdit:col.label, // `label` se convierte en `headerName`
    editable: col.editable,
    inputType: col.inputType || col.type, // Asegurar que `inputType` tenga un valor
    options: col.options || undefined, // Mantener `options`
    multiple:(col.key ==='otrosElementos')? true : false,
    width: (col.widthFormEdit)? col.widthFormEdit : col.width ,
    row: (col.rowFormEdit)?col.rowFormEdit:1, // Definir la fila a la que pertenece (puede ajustarse según necesidades)
  }));
  export const empalmeColumns: ColumnConfig<GridRowType>[] = [
    { key: "nroEmpalme", label: "Empalme", captionPosition: "top", editable: false, type: "string", options: undefined, width: '70px', widthFormEdit:'120px',textAlign:"right", },
    { key: "proveedor", label: "Cliente", captionPosition: "top", editable: true, type: "string" , width: '80px', widthFormEdit:'200px',rowFormEdit:1,
      labelFormEdit:"Nombre cliente"
    },
    { key: "capacidad", label: "KWH transf.", captionPosition: "top", editable: true, type: "number", width: '80px', widthFormEdit:'150px',rowFormEdit:1,
      labelFormEdit:"KWH transformador"
     },
    { key: "distancia", label: "Dist. en mtrs", captionPosition: "top", editable: true, type: "number", options: undefined, width: '80px',rowFormEdit:1, 
      widthFormEdit:'150px',labelFormEdit:"Distancia en mtrs",}, 
    { key: "distribuidora", label: "Distribuidora", captionPosition: "top", editable: true, type: "string", options: undefined, width: '90px',rowFormEdit:2, 
       widthFormEdit:'150px',labelFormEdit:"Distribuidora",},
    { key: "nroCliente", label: "Nr. cliente", captionPosition: "top", editable: true, type: "string", options: undefined, width: '70px',rowFormEdit:2, 
      widthFormEdit:'150px',labelFormEdit:"Nro de cliente",    },
    { key: "capacidadInyeccion", label: "MT inyecc.", captionPosition: "top", editable: true, type: "number", width: '80px',rowFormEdit:2,
      widthFormEdit:'170px',labelFormEdit:"Capacidad de inyección en KWH",   },
    { key: "rutCliente", label: "Copia RUT (pdf/jpg)", captionPosition: "top", editable: true, type:"string", inputType: "file", width: '130px',rowFormEdit:3,  
      widthFormEdit:'170px',labelFormEdit:"Copia del Rut cliente (pdf/jpg)",  },
    { key: "boleta", label: "Boleta (pdf/jpg)", captionPosition: "top", editable: true,type:"string", inputType: "file" , width: '130px',rowFormEdit:3,
      widthFormEdit:'170px',labelFormEdit:"Copia de una boleta (pdf/jpg)", },
    { key: "poder", label: "Poder (pdf/jpg)", captionPosition: "top", editable: true,type:"string", inputType: "file" , width: '130px',rowFormEdit:3,
      widthFormEdit:'170px',labelFormEdit:"Poder cedido por el cliente (pdf/jpg)",   },
    { key: "diagrama", label: "Diagrama (pdf/jpg)", captionPosition: "top", editable: true,type:"string", inputType: "file" , width: '130px',rowFormEdit:4, 
         widthFormEdit:'170px',labelFormEdit:"Subir pdf/jpg diagrama unilienal",},
    { key: "f2", label: "F2 (pdf/jpg)", captionPosition: "top", editable: true,type:"string", inputType: "file" , width: '130px',rowFormEdit:4,
      widthFormEdit:'170px',labelFormEdit:"Subir formulario F2 (pdf/jpg)",},
    { key: "otrasImagenes", label: "Otras img. (pdf/jpg)", captionPosition: "top", editable: true,type:"string", inputType: "file" , width: '140px',rowFormEdit:4,
      widthFormEdit:'170px',labelFormEdit:"Agregar pdf/jpg imágenes adic.",},
    { key: "fechaF3", label: "Fecha F3", captionPosition: "top", editable: true, type: "string", inputType:"date", options: undefined, width: '80px',rowFormEdit:5, 
        labelFormEdit:"Fecha para solitar F3", }, 
    
  ];

  export const empalmeColumnsDynamic: ColumnDynamicForm[] = empalmeColumns.map(col => ({
    field: String(col.key), // `key` se convierte en `field`
    headerName:  (col.labelFormEdit)?col.labelFormEdit:col.label, // `label` se convierte en `headerName`
    editable: col.editable,
    inputType: col.inputType === "file" ? "file" : col.inputType || col.type, // Asegurar que `inputType` tenga un valor
    options: col.options || undefined, // Mantener `options`
    width: (col.widthFormEdit)? col.widthFormEdit : col.width ,
    row: (col.rowFormEdit)?col.rowFormEdit:1,// Definir la fila a la que pertenece (puede ajustarse según necesidades)
  }));
  
export const instalacionesColumns: ColumnConfig<GridRowType>[] = [
  { key: "nroInstalacion", label: "Nro. instalación", captionPosition: "top", editable: false, type: "string", options: undefined, textAlign:"right", },
  { key: "descripcionInstalacion", label: "Descripción edificio", captionPosition: "top", editable: true, type: "string",inputType:"string",required:true,
    labelFormEdit:"Descripción instalación/edificio", widthFormEdit:'300px',rowFormEdit:1, },
  { key: "formaTecho", label: "Forma del techo", captionPosition: "top", editable: true, type: "string",inputType:"selectIcon", visible:false,
     options: techoOptions , widthFormEdit:'120px',rowFormEdit:2,  
      dependencies: [{ field: "nroAguas",valueMap: Object.fromEntries(techoOptions.map(opt => [opt.value, opt.nroAguas])),},
        { field: "descripcionFormaTecho", valueMap: Object.fromEntries(techoOptions.map(opt => [opt.value, opt.label])), }],}, 
  { key: "nroAguas", label: "Nro. de aguas", captionPosition: "top", editable: true, type: "number", required:true,  textAlign:"right",
      widthFormEdit:'100px',rowFormEdit:3,  dependsOn: { field: "formaTecho", value: "otro" }, },
  { key: "descripcionFormaTecho", label: "Descripción Forma techo", captionPosition: "top",width:'200px', editable: true, type: "string", options: undefined, required:true,
     widthFormEdit:'300px',rowFormEdit:3,  dependsOn: { field: "formaTecho", value: "otro" }, },
  { key: "memoriaCalculo", label: "Memoria cálculo (pdf/jpg)", captionPosition: "top", editable: true,type:"string", inputType: "file" , width: '180px',rowFormEdit:3,
    labelFormEdit:"Agregar pdf/jpg memoria de cálculo",},
  { key: "alturaTecho", label: "Altura techo (mtrs)", captionPosition: "top", editable: true, type: "number", required:true,
      widthFormEdit:'100px',rowFormEdit:4,  },
];


export const toDoColumns: ColumnConfig<GridRowType>[] = [
  { key: "infoToDo", label: "Descripción de la tarea", captionPosition: "top", editable: false,width:'700px', type: "string", options: undefined },
  { key: "idTask", label: "idTask", captionPosition: "top", editable: false, visible: false,  type: "number", width:'70px', options: undefined },
  { key: "ubicacionPanel", label: "Ubicacion panel", captionPosition: "top", editable: false, visible: false,  type: "string", width:'70px', options: undefined },
  { key: "usuarioCreador", label: "Usuario creador", captionPosition: "top", editable: false, visible: false,  type: "string", width:'70px', options: undefined },
  { key: "processName", label: "Proceso", captionPosition: "top", editable: false, type: "string", visible: false, options: undefined },
  { key: "nameActivity", label: "Actividad", captionPosition: "top", editable: false, type: "string" , visible: false, options: undefined },
  // { key: "idProcess", label: "Nro Proceso", captionPosition: "top", editable: false, type: "number", options: undefined },
  // { key: "idActivity", label: "Nro Actividad", captionPosition: "top", editable: false, type: "number", options: undefined },
  // { key: "taskAvailableDate", label: "Fecha disponilbe", captionPosition: "top", editable: false, type: "string", options: undefined },
  // { key: "idUserCreate", label: "Usuario creador", captionPosition: "top", editable: false, type: "string", options: undefined },
  // { key: "taskStatus", label: "Status", captionPosition: "top", editable: false, type: "string", options: undefined },
  // { key: "nameRol", label: "Rol", captionPosition: "top", editable: false, type: "string", options: undefined },
  // { key: "activityNumber", label: "Nro. actividad", captionPosition: "top", editable: false, type: "string", options: undefined },
  // { key: "tipoDocumento", label: "Tipo documento", captionPosition: "top", editable: false, type: "string", options: undefined },
  // { key: "nroDocumento", label: "Nro. documento", captionPosition: "top", editable: false, type: "number", options: undefined },
  
];

export const activityColumns: ColumnConfig<GridRowType>[] = [
  { key: "NumActividad", label: "Num.Actividad", captionPosition: "top", editable: false,width:'100px', type: "string",textAlign:'left', options: undefined },
  { key: "Actividad", label: "Actividad", captionPosition: "top", editable: true, visible: true,  type: "string",textAlign:'left', width:'200px', options: undefined,
    widthFormEdit: '300px',rowFormEdit:1,labelFormEdit:'Descripción de la actividad',required: true,
   },
  { key: "FechaInicio", label: "Fecha inicio", captionPosition: "top", editable: true, visible: true,  type: "string",textAlign:'left', inputType: "date", width:'100px', options: undefined,
    widthFormEdit: '190px',rowFormEdit:2, labelFormEdit:'Fecha de inicio de la actividad',required: true,
   },
  { key: "FechaTermino", label: "Fecha término", captionPosition: "top", editable: true, visible: true,  type: "string", inputType: "date", width:'100px', options: undefined,
    widthFormEdit: '190px',rowFormEdit:2, labelFormEdit:'Fecha de término de la actividad',required: true, 
   },
  { key: "Duracion", label: "Duración (días)", captionPosition: "top", editable: false, visible: true,  type: "number", width:'100px', options: undefined },
  { key: "Presupuesto", label: "Presupuesto", captionPosition: "top", editable: true, visible: true,  type: "number", width:'100px', options: undefined ,
    widthFormEdit: '190px',rowFormEdit:3, labelFormEdit:'Presupuesto',required: true,
  },

];
export const activitiesColumnsDynamic:ColumnDynamicForm[] = activityColumns.map(col => ({
  field: String(col.key),
  editable: (col.key !== 'NumActividad' && col.key !== 'Duracion') ,
  width: (col.widthFormEdit)? col.widthFormEdit : col.width ,
  headerName:  (col.labelFormEdit)?col.labelFormEdit:col.label,
  inputType: col.inputType,
  captionPosition: col.captionPosition || "top",
  validationSchema: col.validationSchema || undefined,
  // row: (col.key === 'Actividad')? 1:(col.key !== 'Presupuesto')? 2:3 
  row: (col.rowFormEdit)?col.rowFormEdit:2,
}));

export const instalacionesColumnsDynamic: ColumnDynamicForm[] = instalacionesColumns.map(col => ({
  field: String(col.key), // `key` se convierte en `field`
  headerName:  (col.labelFormEdit)?col.labelFormEdit:col.label, // `label` se convierte en `headerName`
  editable: col.editable,
  inputType: col.inputType === "file" ? "file" : col.inputType || col.type, // Asegurar que `inputType` tenga un valor
  options: col.options || undefined, // Mantener `options`
  width: (col.widthFormEdit)? col.widthFormEdit : col.width ,
  row: (col.rowFormEdit)?col.rowFormEdit:2,// Definir la fila a la que pertenece (puede ajustarse según necesidades)
  dependsOn:col.dependsOn,
  dependencies:col.dependencies,
  required:col.required ,
}));

