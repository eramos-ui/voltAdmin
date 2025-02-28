"use client";
import { useState } from 'react';
// import ActivityUploadSection from '../../components/activity/ActivityUploadSection';
import ActivityUploadSection from '@/components/activity/ActivityUploadSection';
//import ActivityGridSection from '../../components/activity/ActivityGridSection';
import ActivityGridSection from '@/components/activity/ActivityGridSection';
//import ActivityNavigationSection from '@/app/components/activity/ActivityNavigationSection';
import ActivityNavigationSection from '@/components/activity/ActivityNavigationSection';
import { GridRowType } from '@/types/interfaces';
//import { getNextActivityId } from '@/app/utils/getNextAcivityId';
import { getNextActivityId } from '@/utils/getNextAcivityId';
//import { sortGridByActivityId } from '@/app/utils/sortGridByActivityId';
import { sortGridByActivityId } from '@/utils/sortGridByActivityId';
import CustomModal from '@/components/general/CustomModal';
import DynamicForm from '@/components/general/DynamicForm';


const ActivitySection = () => {
  const [ rows, setRows ]                 = useState<GridRowType[]>([]);
  const [ columns, setColumns ]           = useState<any>();
  const [ formColumns, setFormColumns ]   = useState<any>();
  const [ selectedRow, setSelectedRow ]   = useState<GridRowType | null>(null);

  const [ isAdding, setIsAdding ]         = useState(false);
  const [ isEditing, setIsEditing ]       = useState(false);
  const [ editingRow, setEditingRow ]     = useState<GridRowType | null>(null);
  const [ nextActivity, setNextActivity ] = useState<string>("");
  const [ isDirty, setIsDirty ]           = useState(false);

  const handleEdit = (row: GridRowType) => {
    setEditingRow(row);
    setIsEditing(true);
    console.log("Editar actividad:", row);
  };
  const handleAdd = () => {
    if (!selectedRow) {
      alert(`Debe seleccionar la actividad previa a la que desea agregar.`);
      return;
    }
    const currentActivity = selectedRow["NumActividad"].toString();
    const existingIds = new Set(rows?.map((row) => String(row["NumActividad"]))); // Obtener todos los IDs existentes en la grilla
    const newActivity = getNextActivityId(currentActivity,existingIds);
    console.log("Agregar nueva actividad", selectedRow,newActivity);
    setNextActivity(newActivity);
    setIsAdding(true);
  };
  const handleSave = (updatedRow: GridRowType) => {
    if (isAdding) {
      const newRows = rows ? sortGridByActivityId([...rows, updatedRow]) : [updatedRow];
      setRows(newRows);
    } else if (isEditing) {
      const updatedRows = rows?.map(row =>
        row["NumActividad"] === editingRow?.["NumActividad"] ? updatedRow : row
      );
      setRows(updatedRows);
    }
    setIsAdding(false);
    setIsEditing(false);
    setEditingRow(null);
  };
  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingRow(null);
  };
  return (
    <>
    {/* {console.log('en JSX ',isEditing, isAdding)} */}
      <h1 className="text-3xl font-bold text-center">Activity section</h1>
      <ActivityUploadSection 
      //setRows={setRows} rows={rows} 
      //setColumns={setColumns} setFormColumns={setFormColumns} 
      /> 
      {rows.length > 0 && //grilla de actividades
        <ActivityGridSection 
        //columns, handleEdit, handleAdd, selectedRow, setSelectedRow
        //rows={rows} setRows={setRows} 
        columns={columns} handleEdit={handleEdit} handleAdd={handleAdd} 
           selectedRow={selectedRow} setSelectedRow={setSelectedRow} 
        />
      }
        {(isEditing || isAdding) && ( /* 📌 Modal para Agregar o Editar Actividades */
        <CustomModal isOpen={isEditing || isAdding} onClose={handleCancel}  height='70vh'
           title={isAdding ?`Agregar actividad ${nextActivity}`:`Modificar actividad ${editingRow?.["NumActividad"]}`}
        > 
          <DynamicForm columns={formColumns} initialValues={editingRow || {"NumActividad": nextActivity, Actividad: "", Presupuesto: "", FechaInicio: "",
                     FechaTermino: "", }} onSave={handleSave} onCancel={handleCancel} setIsDirty={setIsDirty}/>
        </CustomModal>
        )}
        <ActivityNavigationSection />
    </>
  );
};

export default ActivitySection;


// import { useState } from 'react';
// import { CustomButton, CustomLabel, CustomUploadExcel } from '@/app/components/controls';
// import { useRouter } from 'next/navigation';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { uploadExcelFile } from '@/app/utils/uploadExcelFile';
// import { faFileExcel, faHome } from '@fortawesome/free-solid-svg-icons';
// import { transformToGridRows } from '@/app/utils/transformToGridRows';
// import { ExcelColumn, GridRow } from '@/types/interfaces';
// import { CustomGrid } from '@/app/components/controls/CustomGrid';
// import { generateColumnConfig } from '@/app/utils/generateColumnConfig';
// import CustomModal from '@/app/components/CustomModal';
// import DynamicForm from '@/app/components/DynamicForm';
// import { getNextActivityId } from '@/app/utils/getNextAcivityId';
// import { sortGridByActivityId } from '@/app/utils/sortGridByActivityId';


// const ActivitySection = () =>{
//   const router = useRouter();
//   const [ selectedExcel, setSelectedExcel ]       = useState<File | null>(null);
//   const [ excelFile, setExcelFile ]               = useState<string>('');
//   const [ uploadMessage, setUploadMessage ]       = useState("");
//   const [ disabledUpload, setDisabledUpload ]     = useState(true);
//   const [ columns, setColumns ]                   = useState<any>();
//   const [ editingRow, setEditingRow ]             = useState<GridRow | null>(null); // Fila en edición
//   const [ isEditing, setIsEditing ]               = useState(false); // Indica si se está editando

//  const [ isAdding, setIsAdding ]                  = useState(false); // Estado para agregar
//  const [ rows, setRows ]                          = useState<GridRow[]>();  
//  const [ formColumns, setFormColumns ]            = useState<any>();
//  const [ error, setError ]                        = useState<string | null | undefined>(null);
//  const [ selectedRow, setSelectedRow ]            = useState<any | null>(null);
//  const [ nextActivity, setNextActivity ]          = useState<string>('');

//   const handleRowSelection = (row: any | null) => {
//    //console.log("Fila seleccionada:", row);
//     setSelectedRow(row);
//   };
//   const handleUploadExcel = async (excelFile: File | null) => {
//     //console.log('Excel file',excelFile);
//     setDisabledUpload(true);
//     const response = await uploadExcelFile(excelFile, "/api/uploadExcel");
//     if (response.success) {
//       //console.log('Uplaod success', response.excelColumns);
//       setUploadMessage("Archivo subido exitosamente.");
//       setExcelFile(response.data);
//       const grilla=response.data;
//       //console.log('en ActivityAction grilla',grilla);
//       //const excelColumns: ExcelColumn[]= response.excelColumns ; 
//       //let excelColumns: ExcelColumn[] | [];
//       // const excelColumns: ExcelColumn[]=response.excelColumns || [];
//       const excelColumns: ExcelColumn[] = Array.isArray(response.excelColumns)
//       ? response.excelColumns.map((col: any) =>
//           typeof col === "string"
//             ? { name: col, inputType: "text", type: "string", } // Default si la API no envió el tipo correcto
//             : col
//         )
//       : [];

//       //console.log('excelColumns en ActivitySection',excelColumns);
//       const columnsconfig=generateColumnConfig(grilla,excelColumns);
//       //console.log('columnsconfig',columnsconfig);
//       setColumns(columnsconfig);
//       const formFields = columnsconfig
//             .map(col => ({
//               field: col.key,
//               editable:(col.key === 'NumActividad')? false: true,
//               headerName: col.label,
//               inputType: col.inputType,
//               captionPosition: col.captionPosition || "top",
//               validationSchema: col.validationSchema || undefined,
//               width:col.width,
//               row: col.row || 1
//             }));
//       //console.log('formFields',formFields);
//       setFormColumns(formFields);
//       // Transformar los datos a GridRow[]
//       const rows: GridRow[] = transformToGridRows(grilla);
//       //console.log('rows', rows);
//       setDisabledUpload(false);
//       setError('');
//       setRows(rows)
//     } else {
//       const msg=response.error?.toString();
//       console.log('en activityPage response',msg);
//       setError(msg);
//       setUploadMessage(`Error: ${response.error}`);
//     }    
//   };
//   const handleEdit = (row: GridRow) => {
//     console.log('handleEdit', row);
//     setEditingRow(row); 
//     setIsEditing(true);
//     //setEditingRow(row); // Abre el modal con la fila seleccionada
//   };
//   const handleAdd = () => {
//     if (!selectedRow) {
//       alert(`Debe seleccionar la actividad previa a la que desea agregar.`);
//       return;
//     }
//     // Obtener todos los IDs existentes en la grilla
//     const existingIds = new Set(rows?.map((row) => String(row["NumActividad"])));

//     const currentActivity = selectedRow["NumActividad"];
//     const newActivity = getNextActivityId(currentActivity,existingIds);
//     setNextActivity(newActivity);
//     setIsAdding(true);
//     //setEditingRow(null); // No hay fila en edición
//   };
//   const handleDelete = (row: any) => {
//     // Confirma la eliminación antes de proceder (opcional)
//     const actividadId = row["NumActividad"];//es string
//     // 📌 Verificar si hay hijos en las rows
//     const hasChildren = rows?.some((item) =>
//       item["NumActividad"].toString().startsWith(`${actividadId}.`) // Detecta hijos directos
//     );
//     if (hasChildren) {
//       alert(`No puedes eliminar la actividad "${actividadId} ${row.Actividad}" porque tiene actividades dependientes.`);
//       return;
//     }
//     const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar la actividad "${actividadId} ${row.Actividad}"?`);
//     if (confirmed) {// Elimina la fila 
//       const updatedRows = rows?.filter((item) => item["NumActividad"] !== actividadId);
//       setRows(updatedRows);
//     }
//   };    
//   const handleSave = (updatedRow: any) => { // Guardar cambios
//      //console.log('en handleSave',updatedRow,isAdding,isEditing,editingRow);
//        if (isAdding && updatedRow) {
//         let newRows=updatedRow;
//         if (rows) {
//           newRows = sortGridByActivityId([...rows, updatedRow]);
//         }
//         setRows(newRows);
//       } else if ( isEditing ){
//             const updatedRows = rows?.map((row) => {
//              if (row['NumActividad'] === editingRow?.['NumActividad']){
//                   return updatedRow; 
//              } 
//              return row;
//             });
//             setRows(updatedRows);
//       }
//       setIsEditing(false);
//       setEditingRow(null); // Cierra el modal
//       setIsAdding(false);
//     };
//   const handleCancel = () => {// Cancelar edición
//     setEditingRow(null);
//     setIsAdding(false);
//     setIsEditing(false);
//   };
//   return (
//     <> {/* {console.log('JSX',disabledUpload)} */}
//      <div>
//       <h1 className="text-3xl ont-bold text-center">Activity section</h1>  
//       <div className="mb-4 ml-2 flex items-center space-x-4">
//           <CustomUploadExcel  label="Excel con las actividades" useStandaloneForm={false} showUploadButton={false}
//             onUploadSuccess={(file: File | null) => {setSelectedExcel( file ); } } className="100%"
//           />
//            {selectedExcel && (<span className="ml-0 mt-2 text-blue-600 font-medium truncate max-w-xs">📄 {selectedExcel.name}</span>)}
//             <CustomButton buttonStyle="primary" size="small" htmlType="button" label="Cargar actividades" icon={<FontAwesomeIcon icon={faFileExcel} size="lg" color="white" />}
//                   onClick={() => handleUploadExcel(selectedExcel)} disabled={!selectedExcel || !disabledUpload} style={{ marginTop:'10px' }}
//             >
//           </CustomButton>
//           { error && <CustomLabel label={error} fontColor={'#EF4444'}/>}
//       </div>  
//       <div className="w-full mb-4 ml-5">
//           { rows && 
//           <div>
//             <CustomGrid title="Actividades actuales" columns={columns} data={rows} actions={["add","edit", "delete"]} labelButtomActions={["Agregar actividad","",""]}
//               actionsTooltips= {["Colóquese en la fila bajo la cual agregará la actividad","Editar actividad","Eliminar actividad"]} onAdd={handleAdd} onEdit={handleEdit} 
//               onDelete={(row) => handleDelete(row)} gridWidth="85%" rowsToShow={7} exportable={true} borderVertical={true} rowHeight='30px' selectable={true}
//               onRowSelect={handleRowSelection}
//             />  {/* {selectedRow && <p>Fila seleccionada: {selectedRow["NumActividad"]}</p>} */}
//               {(isEditing || isAdding) && (     
//               <CustomModal isOpen={!!isEditing || isAdding} onClose={handleCancel} title={isAdding ? `Agregar actividad ${nextActivity}` : `Modificar actividad ${editingRow?.["NumActividad"]}`} > 
//                 <DynamicForm columns={formColumns} initialValues={editingRow || {"NumActividad": nextActivity, Actividad: "", Presupuesto: "", FechaInicio: "",
//                     FechaTermino: "", }} onSave={handleSave} onCancel={handleCancel} />
//                 </CustomModal>
//               )}  
//           </div>
//         }
//       </div>
//      </div>
//      <CustomButton
//           buttonStyle="primary" size="small" htmlType="button" label="Volver al página inicial" style={{ marginLeft:5 }}
//           icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={() =>  router.push('/') } 
//       > 
//      </CustomButton>
//     </>        
//   )
// }
// export default ActivitySection;