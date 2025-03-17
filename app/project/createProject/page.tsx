"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter, useSearchParams  } from 'next/navigation';
import { Formik, Form, Field, useFormikContext } from "formik";
import * as Yup from "yup";
import { FeatureCollection, Geometry } from "geojson"; 
import { faEraser, faFloppyDisk, faMapLocation, faHome, faTrash} from '@fortawesome/free-solid-svg-icons';
import { ProjectDetailsForm } from "@/components/project/ProjectDetailsForm";

import { LocationForm } from "@/components/project/LocationForm";

import { Comunas, GridRowType, OptionsSelect, ProjectType } from "@/types/interfaces";
import { MapContext } from "../../context"; 

import { CustomButton, CustomFileInput, CustomGrid, CustomLabel } from "@/components/controls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { processFileToGeoJSON } from "@/utils/kmzProcessor";
import { optionsConectionPointType, optionsLandType, OptionsProjectType, optionsStoneType, optionsCertificadoAccesoType, 
         optionsOrientationType, optionsCeilingElementType, techoOptions } from "@/data/selectType";
import CustomModal from "@/components/general/CustomModal";
import MapComponent from "@/components/maps/MapComponent";
import { loadComunas, loadRegiones} from "@/utils/loadRegionesComunas"

import ActivityUploadSection from "@/components/activity/ActivityUploadSection";

import DynamicForm from "@/components/general/DynamicForm";

import { getNextActivityId } from "@/utils/getNextAcivityId";
import { updateNewProject } from "@/utils/updateNewProject";
import { useSession } from 'next-auth/react'; 
import { loadDataProject } from "@/utils/apiHelpers"

import { activityColumns, activitiesColumnsDynamic } from "@/data/modalColumns";
import { sortGridByActivityId } from "@/utils/sortGridByActivityId";

const validationSchema = Yup.object({
    projectName: Yup.string().required("El nombre del proyecto es obligatorio"),
    region: Yup.string().required("Selecciona una región"),
    comuna: Yup.string().required("Selecciona una comuna"),
    direccion: Yup.string().required("La ubicación es obligatoria"),
    nivelPiedras: Yup.string().required("El nivel de piedras es obligatorio"),
    nivelFreatico: Yup.string().required("El nivel freático es obligatorio"),
    // kmlFile: Yup.mixed().required("El archivo KML/KMZ es obligatorio").test("fileType", "Solo se permiten archivos .kml o .kmz", (value) => {
    //   if (!value) return false; 
    //   return (
    //     value instanceof File && [".kml", ".kmz"].some((ext) => value.name.endsWith(ext))
    //   );
    // }),
  });

const NewProjectPage = () => {
  const router                                                  = useRouter();
  const searchParams                                            = useSearchParams();
  const menuId                                                  = Number(searchParams?.get("menuId"));
  const idTask                                                  = Number(searchParams?.get("idTask"));
  const [ regiones, setRegiones ]                               = useState<OptionsSelect[]>();
  const [ comunasPorRegion, setComunasPorRegion ]               = useState<Comunas[]>(); 
  const [ loading, setLoading ]                                 = useState(true);
  const [ error, setError ]                                     = useState<string | null>(null);
  const [ geoJSONDataL, setGeoJSONDataL ]                       = useState<FeatureCollection<Geometry> | null>(null);//la L es por local para no confundir con setGeoJSONData del context
  const { setGeoJSONData, setSelectedKmlFile, selectedKmlFile } = useContext(MapContext);
  const [ isModalOpen, setIsModalOpen ]                         = useState(false);

  const [ columnsActivities, setColumnsActivities ]             = useState<any>(activityColumns);
  const [ formColumns, setFormColumns ]                         = useState<any>();
  const [ selectedRow, setSelectedRow ]                         = useState<GridRowType | null>(null);//de las activities
  const [ isAdding, setIsAdding ]                               = useState(false);
  const [ isEditing, setIsEditing ]                             = useState(false);
  const [ editingRow, setEditingRow ]                           = useState<GridRowType | null>(null);
  const [ nextActivity, setNextActivity ]                       = useState<string>("");
  const [ isModalOpenKML, setIsModalOpenKML ]                   = useState(false);  
  const { data: session, status }                               = useSession();
  const [ isDirty, setIsDirty ]                                 = useState(false);
  const [ nextActivityToAdd, setNextActivityToAdd ]             = useState<string>();
  const [ activities, setActivities ]                           = useState<any[]>([]);
  const [ initialValues, setInitialValues ]                     = useState <ProjectType>({ idProject:0, projectName: "",
     ubicacionPanel: (menuId === 5) ? 'piso':'techo',  region: 0, comuna: 0, direccion: "",
     nroEmpalmes: 1,  empalmesGrid: [],  instalacionesGrid:[],techoGrid:[], kmlFile: "", excelFile: "", activities:[{"NumActividad":"1.0", Actividad:"Inicial",
        FechaInicio:"","FechaTermino":"",},],
     userModification:"", dateModification: "",state:"draft", tipoTerreno:"", nivelPiedras:"", nivelFreatico:0, nroInstalaciones:1,
 } );
 
 // Este useEffect actualiza nextActivityToAdd cuando cambia selectedRow o activities
 useEffect(() => {
   if (selectedRow) {
     const currentActivity = selectedRow["NumActividad"].toString();
     const existingIds = new Set(activities?.map((row) => String(row["NumActividad"]))); 
     setNextActivityToAdd(getNextActivityId(currentActivity, existingIds));
   }
 }, [selectedRow, activities]);
 
 const openMapModal = (geoJSONDataL: any) => {
    if (geoJSONDataL) {
      setGeoJSONData(geoJSONDataL);
      setSelectedKmlFile(selectedKmlFile);
      setIsModalOpen(true); // 📌 Abre el modal      
    }
 };
 
 const cargaRegiones = async () => setRegiones(await loadRegiones());
 const cargaComunas = async () => setComunasPorRegion(await loadComunas());
 
 useEffect(() => {
    const fetchData = async (idTask:number) => {
      try {
        if (session?.user.id) {
          await loadDataProject(idTask, session.user.id, setInitialValues, initialValues);
        }
      } catch (err) {
        console.log('error', err);
      }
    };
    
    const init = async () => {
      setLoading(true);
      
      if (idTask && idTask > 0) {
        // Revisa si al abrir existe idTask. Esto indica completar proyecto
        await fetchData(idTask);  
      } 
      
      await cargaRegiones();
      await cargaComunas();
      
      setLoading(false);
    };
    
    init();
 }, [idTask, session?.user.id, initialValues]); 
 
 // Este useEffect actualiza el estado activities cuando cambia initialValues.activities
 useEffect(() => {
   if (initialValues.activities) {
     setActivities(initialValues.activities);
   }
 }, [initialValues.activities]);
 
 const handleFileUpload = async (file: File | null) => {
    if (!file) {
      setError("No se seleccionó ningún archivo");
      return;
    }
    try {
      const geoJSON = await processFileToGeoJSON(file);
      if (geoJSON) {
        setGeoJSONDataL(geoJSON);
        setError(null); // Limpia cualquier error previo
      } else {
        setError("No se pudo procesar el archivo. Verificar que sea un archivo KML/KMZ válido.");
      }
    } catch (err) {
      console.error("Error al procesar el archivo:", err);
      setError("Ocurrió un error al procesar el archivo.");
    }
  }; 
  
  const handleAbandon = () => {
    const confirmed = window.confirm(
      "¿Está seguro de que desea abandonar este proyecto? (perderá opción de completarlo y desaparecerá de tus pendientes)"
    );
    //mandar state='abandon'
    //if (confirmed) { router.push('/') }
  };  
  
  const handleExit = () => {
    const confirmed = window.confirm(
      "¿Está seguro de que desea abandonar el proyecto? (perderá lo que haya hecho)"
    );
    if (confirmed) { 
      router.back();
    }
  };  
  
  const handleCloseModal = () => {
    const confirmed = window.confirm("¿Está seguro de cerrar el formulario y perder lo modificado?");
    if (confirmed) {
      setIsAdding(false);
      setIsEditing(false);
      setIsModalOpen(false); //Cierra el formulario si el usuario confirma
    }
  }; 
  
  const SaveCompleteButton = ({ handleSaveComplete }: { handleSaveComplete: (values: any) => void }) => {
    const { values } = useFormikContext(); // 🔹 Obtiene los valores actuales del formulario 
    return (
      <CustomButton 
        buttonStyle="primary" 
        size='small' 
        onClick={() => handleSaveComplete(values)} 
        tooltipContent='Guardar el proyecto' 
        tooltipPosition='left' 
        icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} 
        label='Guardar terminado' 
      />
    );
  };  
  
  const handleSaveComplete = async (vals:any) => { 
    console.log('save complete', vals);
    const userModification = session?.user.email;
    updateNewProject(vals, userModification, 'complete');  
  };
  
  const SaveDraftButton = ({ handleSaveDraft }: { handleSaveDraft: (values: any) => void }) => {
    const { values } = useFormikContext(); // 🔹 Obtiene los valores actuales del formulario 
    return (
      <CustomButton 
        buttonStyle="primary" 
        size="small" 
        onClick={() => handleSaveDraft(values)} 
        tooltipContent="Guardar borrador del proyecto"
        tooltipPosition="bottom" 
        icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} 
        label="Guardar borrador"  
      />
    );
  };
  
  const handleSaveDraft = async (vals:any) => { 
    console.log('handleSaveDraft...');
    if (vals.projectName.length === 0) {
      window.alert("Para guardar un borrador mínimo debe ingresar el nombre del proyecto");
      return;      
    } 
    const userModification = session?.user.email;
    updateNewProject(vals, userModification, 'draft');  
    router.push('/');
  };
  
  const handleRowSelection = (row: any | null) => {
    setSelectedRow(row);
  };
  
  // Renderizado condicional para loading y error
  if (loading) {
    return <p>Cargando...</p>;
  }
  
  if (error) {
    return <p>{error}</p>;
  }
  
  return (
    <>
      <div className="p-4">
        <h1 className="text-3xl font-bold text-center">
          {(idTask && idTask>0) ? 'Completar ' : 'Crear un nuevo '}  
          proyecto fotovoltáico ubicado en {(menuId === 5) ? 'Piso' : 'Techo'}
        </h1>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={(values) => { console.log('onSubmit', values); }}
        >
          {({ values, errors, touched, setFieldValue, resetForm }) => {
            // Actualiza el estado activities cuando cambian los valores de Formik
            useEffect(() => {
              if (values.activities) {
                setActivities(values.activities);
              }
            }, [values.activities]);
            
            const handleCancel = () => {
              const confirmed = window.confirm("¿Está seguro de que desea cancelar y limpiar el formulario?");
              if (confirmed) { 
                resetForm(); 
              }
            };
            
            const handleEdit = (row: any) => {  
              setEditingRow(row); 
              setIsEditing(true); 
              setSelectedRow(row);
            }; 
            
            const handleAdd = () => {
              if (!selectedRow) {
                alert('Debe seleccionar la actividad previa a la que desea agregar.');
                return;
              }
              const currentActivity = selectedRow["NumActividad"].toString();
              const existingIds = new Set(values.activities?.map((row) => String(row["NumActividad"]))); 
              const newActivity = getNextActivityId(currentActivity, existingIds);
              setNextActivity(newActivity);
              setIsAdding(true);
            };
            
            const handleDelete = (row: any) => {
              setEditingRow(row);
              const actividadId = row["NumActividad"];
              const hasChildren = values.activities.some(item =>
                item["NumActividad"].toString().startsWith(`${actividadId}.`)
              );
              if (hasChildren) {
                alert(`No puedes eliminar la actividad "${actividadId} ${row.Actividad}" porque tiene actividades dependientes.`);
                return;
              }
              if (window.confirm(`¿Eliminar la actividad "${actividadId} ${row.Actividad}"?`)) {
                const newRows = values.activities.filter((item) => item["NumActividad"] !== actividadId);
                setFieldValue("activities", newRows);
              }
            };
            
            const handleSave = (updatedRow: GridRowType) => {
              if (isAdding) {
                const newRows = values.activities ? sortGridByActivityId([...values.activities, updatedRow]) : [updatedRow];
                setFieldValue('activities', newRows);
              } else if (isEditing) {
                const updatedRows = values.activities?.map(row =>
                  row["NumActividad"] === editingRow?.["NumActividad"] ? updatedRow : row
                );
                setFieldValue('activities', updatedRows);
              }
              setIsAdding(false);
              setIsEditing(false);
              setEditingRow(null);
            };
            
            return ( 
              <Form>
                <ProjectDetailsForm 
                  errors={errors} 
                  touched={touched} 
                  OptionsProjectType={OptionsProjectType} 
                  optionsLandType={optionsLandType} 
                  optionsStoneType={optionsStoneType} 
                  optionsConectionPointType={optionsConectionPointType} 
                  optionsCertificadoAccesoType={optionsCertificadoAccesoType} 
                  optionsOrientationType={optionsOrientationType}
                  optionsCeilingElementType={optionsCeilingElementType} 
                  techoOptions={techoOptions} 
                />
                
                {regiones && (
                  <LocationForm 
                    regiones={regiones} 
                    comunas={comunasPorRegion} 
                    errors={errors} 
                    touched={touched} 
                  />
                )} 
                
                <div className="mb-4 flex items-center space-x-4">
                  <Field 
                    name='kmlFile' 
                    component={CustomFileInput} 
                    label="Archivo kml o kmz" 
                    accept=".kml,.kmz" 
                    className="100%"
                    value={selectedKmlFile} 
                    useStandaloneForm={false} 
                    showUploadButton={false} 
                    onUploadSuccess={(file: File | null) => {
                      setSelectedKmlFile(file); 
                      handleFileUpload(file); 
                      setFieldValue('kmlFile', file);
                    }} 
                  /> 
                  
                  {errors.kmlFile && touched.kmlFile && (
                    <CustomLabel label={errors.kmlFile} fontColor={'#EF4444'}/>
                  )} 
                  
                  {selectedKmlFile && (
                    <span className="ml-0 mt-2 text-blue-600 font-medium truncate max-w-xs">
                      📄 {selectedKmlFile.name}
                    </span>
                  )}
                  
                  <CustomButton 
                    onClick={() => {
                      openMapModal(selectedKmlFile); 
                      setIsModalOpenKML(true);
                    }} 
                    buttonStyle="primary" 
                    htmlType="button" 
                    label="Abrir mapa" 
                    size="small"
                    icon={<FontAwesomeIcon icon={faMapLocation} size="lg" color="white" />} 
                    style={{ marginTop:'10px' }} 
                    disabled={!selectedKmlFile}
                  />
                  
                  <CustomModal 
                    isOpen={isModalOpenKML} 
                    onClose={() => {setIsModalOpenKML(false);}} 
                    title="Mapa" 
                    height="160vh" 
                    width="1000px"
                  >
                    {selectedKmlFile && (
                      <MapComponent geoJSONData={geoJSONDataL} />
                    )} 
                  </CustomModal>
                </div>
                
                {(idTask === 0) && (
                  <div className="mb-4 flex items-center space-x-4">
                    <ActivityUploadSection />
                  </div>
                )}
                
                {values.activities && values.activities.length > 1 && (
                  <div style={{ marginLeft:"0rem" }}>
                    <CustomGrid 
                      title="Actividades actuales" 
                      columns={columnsActivities} 
                      data={values.activities} 
                      actions={["add", "edit", "delete"]} 
                      fontSize="13px"
                      labelButtomActions={[(selectedRow) ? `Agregar actividad ${nextActivityToAdd}` : 'Agregar actividad', "", ""]}
                      actionsTooltips={[
                        `Agregar actividad que sigue a la seleccionada (${nextActivityToAdd})`, 
                        "Editar esta actividad", 
                        "Eliminar esta actividad"
                      ]}
                      onAdd={handleAdd} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                      gridWidth="95%" 
                      rowsToShow={7} 
                      exportable={true} 
                      borderVertical={true} 
                      rowHeight="30px" 
                      selectable={true} 
                      onRowSelect={handleRowSelection}                 
                    />
                  </div>
                )}
                
                {(isEditing || isAdding) && (
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}>
                    <CustomModal 
                      isOpen={isEditing || isAdding} 
                      onClose={handleCloseModal} 
                      height='70vh' 
                      width="800px"
                      title={isAdding ? `Agregar actividad ${nextActivity}` : `Modificar actividad ${editingRow?.["NumActividad"]}`}
                    > 
                      <DynamicForm 
                        columns={activitiesColumnsDynamic} 
                        initialValues={
                          editingRow || {
                            "NumActividad": nextActivity, 
                            Actividad: "", 
                            Presupuesto: "", 
                            FechaInicio: "",
                            FechaTermino: "", 
                          }
                        } 
                        onSave={handleSave} 
                        onCancel={handleCancel} 
                        setIsDirty={setIsDirty}   
                      />
                    </CustomModal>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mr-10">
                  {(idTask > 0) && (
                    <CustomButton 
                      buttonStyle="secondary" 
                      size='small' 
                      htmlType='button' 
                      tooltipContent='botar el proyecto' 
                      tooltipPosition='bottom' 
                      onClick={handleAbandon} 
                      icon={<FontAwesomeIcon icon={faTrash} size="lg" color="white" />} 
                      label='Abandonar proyecto'  
                    />
                  )}
                  
                  {(idTask === 0) && (
                    <CustomButton 
                      buttonStyle="secondary" 
                      size='small' 
                      htmlType='button' 
                      tooltipContent='Limpiar el formulario' 
                      tooltipPosition='bottom' 
                      onClick={handleCancel} 
                      icon={<FontAwesomeIcon icon={faEraser} size="lg" color="white" />} 
                      label='Cancelar' 
                    />
                  )}
                  
                  <SaveDraftButton handleSaveDraft={handleSaveDraft} />
                  <SaveCompleteButton handleSaveComplete={handleSaveComplete} />
                </div>
              </Form>
            );
          }}
        </Formik>
        
        <CustomButton 
          buttonStyle="primary" 
          size="small" 
          htmlType="button" 
          label="Volver al página inicial" 
          style={{ marginLeft:5 }}
          icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} 
          onClick={handleExit} 
        />
      </div>
    </>
  );
};

export default NewProjectPage;