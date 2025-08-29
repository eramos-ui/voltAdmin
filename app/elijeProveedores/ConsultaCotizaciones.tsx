import { useEffect, useState } from "react";
import { CustomButton, CustomGrid } from "@/components/controls";
import {  faCircleArrowUp, faArrowRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingIndicator } from "@/components/general/LoadingIndicator";
import { ColumnConfigType, GridRowType } from "@/types/interfaces";

interface ConsultaProps {
    idProject: number;
    idProjectActivity: number;
    title: string;
    setShowConsulta: (show: boolean) => void;
  }
interface Row {
    idProjectActivity: number;
    idProject: number;
    idActivity: number;
    contacto: string;
    nombreProveedor: string;
    emailProveedor: string;
    createdAt: string;
    actividad: string;
    
}

const columns:ColumnConfigType<GridRowType>[] = [
    { key: "idProjectActivity", label: "idProjectActivity", captionPosition: "top",visible: false, editable: false, width: '100px', type: "number", options: undefined },
    { key: "idProject", label: "idProject", captionPosition: "top", visible: false, editable: false, width: '100px', type: "number", options: undefined },
    { key: "idActivity", label: "idActivity", captionPosition: "top", visible: false, editable: false, width: '100px', type: "number", options: undefined },
    { key: "contacto", label: "Contacto", captionPosition: "top", editable: false, width: '100px', type: "string", options: undefined },
    { key: "nombreProveedor", label: "Proveedor", captionPosition: "top", editable: false, width: '100px', type: "string", options: undefined },
    { key: "emailProveedor", label: "Email", captionPosition: "top", editable: false, width: '200px', type: "string", options: undefined },
    { key: "createdAt", label: "Fecha envío", captionPosition: "top", editable: false, width: '100px', type: "string", options: undefined },
    { key: "actividad", label: "Actividad", captionPosition: "top", editable: false, width: '150px', type: "string", options: undefined },
    { key: "solicitaInfo", label: "Solicitó información", captionPosition: "top", editable: false, width: '150px', type: "string", options: undefined },
    { key: "cotizo", label: "Hay cotización", captionPosition: "top", editable: false, width: '150px', type: "string", options: undefined },
]
  
export const ConsultaCotizaciones = ({idProject, idProjectActivity, title, setShowConsulta}: ConsultaProps) => {
    const [ loading, setLoading             ]                       = useState(true);
    const [ rows, setRows ]                                         = useState<GridRowType[]>([]);
    const leeEmailStatus = async () => {     //  console.log('loadDataActivity',idTask,email); 
        try {
            const response = await fetch(`/api/projectActivity/emailStatus?idProject=${idProject}&idProjectActivity=${idProjectActivity}`);    
            if (!response.ok) {
                throw new Error(`Failed to fetch form data: ${response.statusText}`);
            }
            const data = await response.json();  
            // console.log('data en ConsultaCotizaciones', data.projectEmails);
            const rowsFormated = data.projectEmails.map((row: Row) => ({
                idProjectActivity: row.idProjectActivity,
                idProject: row.idProject,
                idActivity: row.idActivity,
                contacto: row.contacto,
                nombreProveedor: row.nombreProveedor,
                emailProveedor: row.emailProveedor,
                createdAt: row.createdAt.split('T')[0],
                actividad: row.actividad,
            }));
            setRows(rowsFormated);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error fetching email status:', error);
        }
    }
    useEffect(() => {
        leeEmailStatus();        
    }, []);

    const handleBack = () => {
        setShowConsulta(false);
    }
    if (loading) {
        return <LoadingIndicator message={'cargando'} />;
    }
    return (
        (rows.length>0) 
        ? 
        <>
            <div>
                <h1 style={{ marginLeft:5, marginTop:10 }}>{title}</h1>
            </div>
            <div className="ml-5 mt-3">
                <CustomGrid title={'Solicitudes de cotización'} columns={columns} data={rows} 
                gridWidth="100%" rowsToShow={10} exportable={false} borderVertical={true} rowHeight="30px" selectable={true} actionsPositionTooltips={['left','left','left']}
                //   onRowSelect={handleRowSelection} 
                fontSize="13px" actions={[ "edit"]}  
                //   onEdit={handleEdit} 
                actionsTooltips= {["","Revisar cotización"]}
                labelButtomActions= {["Revisar", "", ""]}
                />

            </div>
            <div className="mt-3 flex items-start ">
                <CustomButton buttonStyle="primary" size="small" htmlType="button" label="Volver al página anterior" tooltipContent='Volver a seleccionar otra actividad'
                    tooltipPosition='top' style={{ marginLeft:5 }}icon={<FontAwesomeIcon icon={faArrowRightToBracket} size="lg" color="white" />} onClick={ handleBack }
                />
            </div>
        </>        
        :
        <>
            <div>
                <p>No hay cotizaciones para la actividad </p>
            </div>      
            <div className="mt-3 flex items-start ">
                <CustomButton buttonStyle="primary" size="small" htmlType="button" label="Volver al página anterior" tooltipContent='Volver a seleccionar otra actividad'
                    tooltipPosition='top' style={{ marginLeft:5 }}icon={<FontAwesomeIcon icon={faArrowRightToBracket} size="lg" color="white" />} onClick={ handleBack }
                />
            </div>

        </>
    )  
      
}