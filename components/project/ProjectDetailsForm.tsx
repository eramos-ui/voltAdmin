import { useEffect, useState } from "react";
import { useFormikContext, Field  } from "formik";
import _ from 'lodash';
import { CustomInput } from "@/components/controls/CustomInput";
import { CustomSelect } from "@/components/controls/CustomSelect";
import  CustomModal  from "@/components/general/CustomModal";
//import  DynamicForm from "@/app/components/DynamicForm";
import DynamicForm from "../general/DynamicForm";
//import { CustomGrid } from "../../../components/controls";
import { CustomGrid } from "../controls";
import { GridRowType, OptionSelectIcon, ProjectFormValuesType } from "@/types/interfaces";
import { empalmeColumns, empalmeColumnsDynamic, instalacionesColumns, instalacionesColumnsDynamic, techoColumns, techoColumnsDynamic } from "@/data/modalColumns";
import { validaModalInstalacion } from "@/utils/validaModalInstalacion";

interface ProjectDetailsFormProps {
  errors: any;
  touched: any;
  OptionsProjectType: { value: string; label: string }[];
  optionsLandType: { value: string; label: string }[];
  optionsStoneType: { value: string; label: string }[];
  optionsConectionPointType: { value: string; label: string }[];
  optionsCertificadoAccesoType: { value: string; label: string }[];
  optionsOrientationType: { value: string; label: string }[];
  optionsCeilingElementType: { value: string; label: string }[];
  techoOptions: OptionSelectIcon[];
}

export const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({ errors, touched, optionsLandType, optionsStoneType,
 }) => { 
  const { values, setFieldValue }                                    = useFormikContext<ProjectFormValuesType>(); // ✅ Especifica el tipo // Hook de Formik para manejar valores
  const [ isEditingAguas, setIsEditingAguas ]                        = useState(false);
  const [ editingAguas, setEditingAguas ]                            = useState<any | null>(null);
  const [ rowsAgua, setRowsAgua ]                                    = useState<any[]>([]);
  const [ rowsInstalacion, setRowsInstalacion ]                      = useState<any[]>([]);
  const [ rowsEmpalme, setRowsEmpalme ]                              = useState<any[]>([]);
  const [ editingEmpalme, setEditingEmpalme ]                        = useState<any | null>(null);
  const [ editingInstalacion, setEditingInstalacion ]                = useState<any | null>(null);
  const [ isEditingEmpalme, setIsEditingEmpalme ]                    = useState(false);  
  const [ isEditingInstalacion, setIsEditingInstalacion ]            = useState(false);  
  const [ editingEmpalmeIndex, setEditingEmpalmeIndex ]              = useState<number>(0); 
  const [ editingInstalacionIndex, setEditingInstalacionIndex ]      = useState<number>(0); 
  const [ editingAguaIndex, setEditingAguaIndex ]                    = useState<number>(0); 
  const [ isDirtyInstalacion, setIsDirtyInstalacion ]                = useState(false);
  const [ isDirtyEmpalme, setIsDirtyEmpalme ]                        = useState(false);
  const [ isDirtyAguas, setIsDirtyAguas ]                            = useState(false);
  const [ selectedInstalacion, setSelectedInstalacion ]              = useState<number>(0);
  const [ selectedRowAgua, setSelectedRowAgua ]                      = useState<any | null>(null);
  const handleCancel = (isDirty: boolean, setEditing: (val: boolean) => void) => {
    if (isDirty) {
      if (window.confirm("Tienes cambios sin guardar. ¿Deseas salir?")) {
        setEditing(false);
      }
    } else { 
      setEditing(false);
    }
  };
  const ajustaFilasAguasInstalacion=()=>{
    const currentTechoGrid = Array.isArray(values.techoGrid) ? values.techoGrid : [];
    const rowInstalacion=Array.isArray( values.instalacionesGrid.filter(rw => rw.nroInstalacion === selectedInstalacion))
    ? values.instalacionesGrid.filter(rw => rw.nroInstalacion === selectedInstalacion) : [];
    const aguasInstalacion=Array.isArray( values.techoGrid.filter( inst => inst.nroInstalacion === selectedInstalacion ))
    ?values.techoGrid.filter( inst => inst.nroInstalacion === selectedInstalacion ):[];
    const currentLength=aguasInstalacion?.length || 0;
    const newLength=rowInstalacion[0]?.nroAguas;
    if (newLength > currentLength) {
      const nuevasFilas = Array.from({ length: newLength - currentLength }, (_, index) => ({
        nroInstalacion: selectedInstalacion, nroAgua: currentLength + index + 1,orientacion:"",material:"",area:0,pendiente:0,
        formaTecho: "",descripcionFormaTecho:"",imagenTecho:null,
      }));
      setFieldValue("techoGrid", [...currentTechoGrid, ...nuevasFilas]);
    } else if (newLength <= currentLength) {
      setFieldValue("techoGrid", values.techoGrid.slice(0, newLength));  
    }
  }
  useEffect(()=>{
      if (selectedInstalacion >0 ){ ajustaFilasAguasInstalacion();   }
  },[values.instalacionesGrid, selectedInstalacion ])
  useEffect(()=>{
     ajustaFilasAguasInstalacion();
  },[values.instalacionesGrid])
  useEffect(() => {
    if (values.nroInstalaciones && values.nroInstalaciones > 0) {
      const currentInstalacionesGrid = Array.isArray(values.instalacionesGrid) ? values.instalacionesGrid : [];
      const currentLength = values.instalacionesGrid?.length || 0; // Evita que sea undefined
      const newLength = values.nroInstalaciones;
      if (newLength > currentLength) {// 📌 Si `nroAguas` aumenta, agregamos nuevas filas a techoGrid
        const nuevasFilas = Array.from({ length: newLength - currentLength }, (_, index) => ({
          nroInstalacion: currentLength + index + 1,nroAguas: 1, formaTecho: "",descripcionFormaTecho:"",memoriaCalculo:null,
        }));
        setFieldValue("instalacionesGrid", [...currentInstalacionesGrid, ...nuevasFilas]);
      }else if (newLength < currentLength) { // 📌 Si `nroAguas` disminuye, eliminamos las filas extras
        setFieldValue("instalacionesGrid", values.instalacionesGrid.slice(0, newLength));
      }
    }
  }, [values.nroInstalaciones, setFieldValue]);
  useEffect(() => {    
    if (values.nroEmpalmes && values.nroEmpalmes > 0) {
      const currentEmpalmesGrid = Array.isArray(values.empalmesGrid) ? values.empalmesGrid : [];
      const currentLength = values.empalmesGrid?.length || 0; // Evita que sea undefined
      const newLength = values.nroEmpalmes;
      if (newLength > currentLength) {// 📌 Si `nroAguas` aumenta, agregamos nuevas filas
        const nuevasFilas = Array.from({ length: newLength - currentLength }, (_, index) => ({
          nroEmpalme: currentLength + index + 1, // Mantiene numeración correcta
          proveedor: "", capacidad: 0, distancia: 0, nroCliente: "",capacidadInyeccion:0, rutCliente: null,boleta:null,poder:null,f2:null, 
                       diagrama: null, otrasImagenes:null, fechaF3:"",
        }));
        setFieldValue("empalmesGrid", [...currentEmpalmesGrid, ...nuevasFilas]);
      }else if (newLength < currentLength) { // 📌 Si `nroAguas` disminuye, eliminamos las filas extras
        setFieldValue("empalmesGrid", values.empalmesGrid.slice(0, newLength));
      }
    }
  }, [values.nroEmpalmes, setFieldValue]);
  const handleEditAgua = (row: GridRowType) => {//clic sobre el botón acciones 'edit'
    const rowIndex = values.techoGrid.findIndex((r) => r.nroInstalacion === row.nroInstalacion && r.nroAgua === row.nroAgua);
    if (rowIndex !== -1) {
      setEditingAguaIndex(rowIndex);
      setEditingAguas(row);
      setIsEditingAguas(true);
    }
  };
  const handleInstalacionEdit = (row: any ) =>{
    const rowIndex = values.instalacionesGrid.findIndex((r) => r.nroInstalacion === row.nroInstalacion);
    if (rowIndex !== -1) {
      setEditingInstalacion(row);
      setIsEditingInstalacion(true);
      setEditingInstalacionIndex(rowIndex); 
    }
  }
  const handleEmpalmeEdit = (row: any ) =>{
    const rowIndex = values.empalmesGrid.findIndex((r) => r.nroEmpalme === row.nroEmpalme);
    if (rowIndex !== -1) {
      setEditingEmpalme(row);
      setEditingEmpalmeIndex(rowIndex); 
      setIsEditingEmpalme(true);
    }
  }
  const handleSaveAgua = (updatedAgua: any) => {
    console.log('handleSaveAgua',updatedAgua);
    if (!editingAguas || editingAguaIndex <0 ) return;      
    const updatedAguas = [...values.techoGrid];

    updatedAguas[editingAguaIndex] = { 
      ...updatedAguas[editingAguaIndex], 
      ...updatedAgua, // ✅ Actualiza los datos de la fila
      imagenTecho: updatedAgua.imagenTecho || updatedAguas[editingAguaIndex].imagenTecho || "No subido",
    }; 
    setFieldValue("techoGrid",  updatedAguas);
    setEditingAguas(null);
    setIsEditingAguas(false);
  };
  const handleSaveEmpalme =( updatedEmpalme: any) =>{
    if (!editingEmpalme || editingEmpalmeIndex <0 ) return;      
      const updatedEmpalmes = [...values.empalmesGrid];
      updatedEmpalmes[editingEmpalmeIndex] = { 
        ...updatedEmpalmes[editingEmpalmeIndex], 
        ...updatedEmpalme, // ✅ Actualiza los datos de la fila
        rutCliente: updatedEmpalme.rutCliente || updatedEmpalmes[editingEmpalmeIndex].rutCliente || "No subido",
        boleta: updatedEmpalme.boleta || updatedEmpalmes[editingEmpalmeIndex].boleta || "No subido",
        poder: updatedEmpalme.poder || updatedEmpalmes[editingEmpalmeIndex].poder || "No subido",
        diagrama: updatedEmpalme.diagrama || updatedEmpalmes[editingEmpalmeIndex].diagrama || "No subido",
        otrasImagenes:updatedEmpalme.otrasImagenes || updatedEmpalmes[editingEmpalmeIndex].otrasImagenes || "No subido",
        f2:updatedEmpalme.f2 || updatedEmpalmes[editingEmpalmeIndex].f2 || "No subido",
      };    
    setFieldValue("empalmesGrid", updatedEmpalmes);
    setEditingEmpalme(null);
    setIsEditingEmpalme(false);
  }
  const handleSaveInstalacion =( updatedInstalacion: any) =>{//console.log('handleSaveInstalacion',updatedInstalacion,updatedInstalacion.nroInstalacion);
    if (!validaModalInstalacion (updatedInstalacion)) return;
    if (!editingInstalacion || editingInstalacionIndex < 0 ) return;      
      const updatedInstalaciones = [...values.instalacionesGrid];
      updatedInstalaciones[editingInstalacionIndex] = { 
        ...updatedInstalaciones[editingInstalacionIndex], 
        ...updatedInstalacion, // ✅ Actualiza los datos de la fila
        memoriaCalculo:updatedInstalacion.memoriaCalculo || updatedInstalaciones[editingInstalacionIndex].memoriaCalculo || "No subido",
    };    
    setFieldValue("instalacionesGrid", updatedInstalaciones);
    setEditingInstalacion(null);
    setIsEditingInstalacion(false);
  }
  const handleCancelEmpalme = () => {
    let confirmed=true;
    if (!isDirtyEmpalme){
      confirmed = window.confirm("¿Está seguro de cerrar el formulario y perder lo modificado para el empalme?" );
    }
    if (confirmed) {
      setIsEditingEmpalme(false);
      setEditingEmpalme(null);
    }
  };
  const handleCancelInstalacion = () => {
     let confirmed=true;
     if (!isDirtyInstalacion){
       confirmed = window.confirm("¿Está seguro de cerrar el formulario y perder lo modificado para el instalación?" );
     }
     if (confirmed) {
       setIsEditingInstalacion(false);
       setEditingInstalacion(null);
     }
  };
  const handleCancelAguas = () => {
    let confirmed=true;
    if (!isDirtyAguas){
      confirmed = window.confirm("¿Está seguro de cerrar el formulario y perder lo modificado para el agua?" );
    }
    if (confirmed) {
      setIsEditingAguas(false);
      setEditingAguas(null);
    }
  };
  const handleRowSelection = (grid:string,row: any | null) => {// la fila seleccionada está aquí o en el handleEdit de c/grilla 
    if (grid === 'instalacion' && row){ setSelectedInstalacion(row.nroInstalacion);  //setSelectedRowInstalacion(row);
    } else if (grid === 'techo') { setSelectedRowAgua(row);  }
   };
   const handleFileUploadInstalacion= (file: File | null, rowIndex?: number, field?: string) => {
    if (!file || rowIndex === undefined || field === undefined) return; //
    console.log(`📂 en instalación Archivo subido (${field}):`, file.name, `para fila ${rowIndex}`); 
    const updatedInstalaciones = [...values.instalacionesGrid];     
    updatedInstalaciones[rowIndex] = { // 📌 Actualiza SOLO el archivo correspondiente en la fila específica
      ...updatedInstalaciones[rowIndex], 
      [field]: file.name // ✅ Guarda el nombre del archivo en el campo correcto
    };
    setFieldValue("instalacionesGrid", updatedInstalaciones);
  };  
  const handleFileUploadEmpalme = (file: File | null, rowIndex?: number, field?: string) => {
    if (!file || rowIndex === undefined || field === undefined) return; //
    console.log(`📂 en empalmes Archivo subido (${field}):`, file.name, `para fila ${rowIndex}`); 
    const updatedEmpalmes = [...values.empalmesGrid];    
    updatedEmpalmes[rowIndex] = { // 📌 Actualiza SOLO el archivo correspondiente en la fila específica
      ...updatedEmpalmes[rowIndex], 
      [field]: file.name // ✅ Guarda el nombre del archivo en el campo correcto
    };
    setFieldValue("empalmesGrid", updatedEmpalmes);
  };  
  const handleFileUploadTecho  = (file: File | null, rowIndex?: number, field?: string) => {
    if (!file || rowIndex === undefined || field === undefined) return; //
    console.log(`📂 en techo Archivo subido (${field}):`, file.name, `para fila ${rowIndex}`); 
    const updatedTechos = [...values.techoGrid];    
    updatedTechos[rowIndex] = { // 📌 Actualiza SOLO el archivo correspondiente en la fila específica
      ...updatedTechos[rowIndex], 
      [field]: file.name // ✅ Guarda el nombre del archivo en el campo correcto
    };
    setFieldValue("techoGrid", updatedTechos);
  };  
  return (
    <>    {/* {console.log('JSX ProjectDetailsForm',values.techoGrid,selectedInstalacion)} */}
       <div className="mb-1 flex items-start space-x-2">
          <div className="w-3/5">
            <Field name="projectName" type="text" as={CustomInput} label="Nombre del Proyecto" placeholder="Ingresa el nombre del proyecto"
              error={touched.projectName && errors.projectName ? errors.projectName : undefined} required theme="light" width="100%" 
              onChange={(e:any) => setFieldValue("projectName", e.target.value)}
            />
          </div>
          <div className="w-12/5">
              <Field name="nroEmpalmes" type="number" as={CustomInput} label="Número de empalmes" placeholder="Indique el nro.de empalmes"
              error={touched.nroEmpalmes && errors.nroEmpalmes ? errors.nroEmpalmes : undefined} required theme="light" width="100%" 
              onChange={(e:any) => setFieldValue("nroEmpalmes", e.target.value)}
            />
          </div>
        </div>
        { (values.empalmesGrid && values.nroEmpalmes>0 )  && (
              <div className="mb-2 flex items-start space-x-2">
                  <CustomGrid title="Detalles de Empalmes" columns={empalmeColumns} actions={[ "edit"]} rowsToShow={2} fontSize="13px"
                    data={values.empalmesGrid.map(row => ({
                      ...row,
                      rutCliente: row.rutCliente instanceof File ? row.rutCliente.name : row.rutCliente || "No subido",
                      boleta: row.boleta instanceof File ? row.boleta.name : row.boleta || "No subido",
                      poder: row.poder instanceof File ? row.poder.name : row.poder || "No subido",
                      diagrama: row.diagrama instanceof File ? row.diagrama.name : row.diagrama || "No subido",
                      otrasImagenes:row.otrasImagenes instanceof File ? row.otrasImagenes.name : row.otrasImagenes || "No subido",
                      f2:row.f2 instanceof File ? row.f2.name : row.f2 || "No subido",
                    }))}
                    actionsTooltips= {["","Editar empalme"]}  rowHeight='30px' selectable={true}
                    onEdit={(row) => handleEmpalmeEdit(row)} onDelete={(row) =>  setRowsEmpalme(rowsEmpalme.filter(r => r.nroEmpalme !== row.nroEmpalme))} 
                    borderVertical={true} onRowSelect={(row)=> handleRowSelection('empalme',row)} //isEditable={isEditable}  
                  />
                    {(isEditingEmpalme && editingEmpalme  ) && (
                    <CustomModal isOpen={isEditingEmpalme } height="140vh" width="1200px" onClose={() => handleCancel(isDirtyEmpalme, setIsEditingEmpalme)} 
                      title={`Editar empalme ${editingEmpalme.nroEmpalme}`}>
                      <DynamicForm columns={empalmeColumnsDynamic} onSave={handleSaveEmpalme} onCancel={handleCancelEmpalme} rowIndex={editingEmpalmeIndex} 
                         handleFileUpload={handleFileUploadEmpalme} initialValues={ editingEmpalme || { nroEmpalme: rowsEmpalme.length + 1, proveedor: "", capacidad: 0, distancia: 0, 
                          nroCliente: "", capacidadInyeccion:0, rutCliente: null, boleta:null, poder:null, otrasImagenes:null,f2:null,fechaF3:"" }} setIsDirty={setIsDirtyEmpalme}
                      />
                    </CustomModal>
                    )}
              </div>
            )
          }
        {values.ubicacionPanel === "piso" && (
          <div className="mb-2 flex items-start space-x-2">
            <div className="w-2/12">
              <Field name="tipoTerreno">
                {({ field }: any) => (
                  <CustomSelect label="Tipo terreno" options={optionsLandType} placeholder="Elija tipo terreno" required 
                    theme="light" width="100%" value={values.tipoTerreno} onChange={(val) => setFieldValue("tipoTerreno", val)}
                  />
                )}
              </Field>
            </div>
            <div className="w-2/12">
                <Field name="nivelPiedras" error={touched.nivelPiedras && errors.nivelPiedras ? errors.nivelPiedras : undefined}>
                  {({ field }: any) => (
                    <CustomSelect label="Nivel de piedras" options={optionsStoneType} placeholder="Elija nivel piedras" required theme="light" 
                        captionPosition="top" width="100%" value={values.nivelPiedras} onChange={(val) => setFieldValue("nivelPiedras", val)}
                    />
                  )}
                </Field>
            </div>
            <div className="w-2/12">
                  <Field name="nivelFreatico" type="number" as={CustomInput} label="Nivel freático (mtrs)" placeholder="Ingrese nivel freático"
                    captionPosition="top" error={touched.nivelFreatico && errors.nivelFreatico ? errors.nivelFreatico : undefined} required theme="light" width="100%"
                  />
            </div>
          </div>
        )}
        {values.ubicacionPanel === "techo" && (
          <>
            <div className="mb-2 flex items-start space-x-2">
              <div className="w-2/12">
                  <Field name="nroInstalaciones" type="number" as={CustomInput} label="Número de edificios" placeholder="Indique nro.edificios"
                    error={touched.nroInstalaciones && errors.nroInstalaciones ? errors.nroInstalaciones : undefined} required theme="light" width="100%"
                  />
              </div>
            </div>
            { values.nroInstalaciones>0 && values.instalacionesGrid && (
              <div className="mb-2 flex items-start space-x-2">
                  <CustomGrid title="Detalles de Instalaciones-Edificios" columns={instalacionesColumns} actions={[ "edit"]}
                    data={values.instalacionesGrid.map(row => ({ ...row, 
                      memoriaCalculo: row.memoriaCalculo instanceof File ? row.memoriaCalculo.name : row.memoriaCalculo || "No subido",}))}  
                    actionsTooltips= {["","Editar instalación"]} rowHeight='30px' selectable={true}
                    onEdit={(row) => handleInstalacionEdit(row)} onDelete={(row) => setRowsInstalacion(rowsInstalacion.filter(r => r.nroInstalaciones !== row.nroInstalacion))} 
                    rowsToShow={3}  borderVertical={true} onRowSelect={(row)=> handleRowSelection('instalacion',row)} fontSize="13px" //isEditable={isEditable}
                  />
                    {(isEditingInstalacion && editingInstalacion ) && (
                    <CustomModal isOpen={isEditingInstalacion} height="100vh" width="1300px"  onClose={() => handleCancel(isDirtyInstalacion, setIsEditingInstalacion)} 
                       title={`Editar instalación N° ${editingInstalacion?.nroInstalacion}`}>
                      <DynamicForm columns={instalacionesColumnsDynamic} onSave={ handleSaveInstalacion } onCancel={handleCancelInstalacion} rowIndex={editingInstalacionIndex}  // handleSelectedIcon={handleSelectedIcon} 
                        handleFileUpload={handleFileUploadInstalacion} initialValues={{ nroInstalacion:editingInstalacion?.nroInstalacion || rowsInstalacion.length + 1,
                        alturaTecho:editingInstalacion.alturaTecho ||0,descripcionInstalacion: editingInstalacion?.descripcionInstalacion, 
                        descripcionFormaTecho:editingInstalacion?.descripcionFormaTecho || "", formaTecho:editingInstalacion?.formaTecho || "", 
                        nroAguas:editingInstalacion?.nroAguas || 0, memoriaCalculo:editingInstalacion?.memoriaCalculo || null, }} setIsDirty={setIsDirtyInstalacion}
                      />
                    </CustomModal>
                    )}
              </div>
              )
            }
            { selectedInstalacion > 0 && values.techoGrid && (
              <div className="mb-2 flex items-start space-x-2">
                  <CustomGrid title={`Detalles del techo de instalación N° ${selectedInstalacion} ` } columns={techoColumns}actions={[ "edit"]} rowsToShow={3} fontSize="13px"
                    data={values.techoGrid.filter( rw => rw.nroInstalacion === selectedInstalacion).map(row => ({ ...row, 
                      otrosElementos: Array.isArray(row.otrosElementos) ? row.otrosElementos.join(", ") : row.otrosElementos, 
                      imagenTecho: row.imagenTecho instanceof File ? row.imagenTecho.name : row.imagenTecho || "No subido",
                     }))}
                    actionsTooltips= {["","Editar agua"]} rowHeight='30px' selectable={true}
                    onEdit={(row) => handleEditAgua(row)} onDelete={(row) => setRowsAgua(rowsAgua.filter(r => r.nroAgua !== row.nroAgua))} 
                    borderVertical={true} onRowSelect={(row)=> handleRowSelection('techo',row)} //isEditable={isEditable}
                  />
                    { isEditingAguas  && (
                    <CustomModal isOpen={isEditingAguas} height="50vh" width="1000px"  onClose={() => handleCancel(isDirtyAguas, setIsEditingAguas)}  
                       title={`Editar agua ${selectedRowAgua.nroAgua} del edificio ${selectedInstalacion}`}    >
                      <DynamicForm columns={techoColumnsDynamic} onSave={handleSaveAgua} onCancel={handleCancelAguas} rowIndex={editingAguaIndex} 
                          handleFileUpload={handleFileUploadTecho} initialValues={ editingAguas || { nroAgua: rowsAgua.length + 1, orientacion: "", material: "",
                            area: 0, pendiente: 0, imagenTecho: null }} setIsDirty={setIsDirtyAguas}
                      />
                    </CustomModal>
                    )}
              </div>
            )}
          </>
       )}
    </>
  );
};