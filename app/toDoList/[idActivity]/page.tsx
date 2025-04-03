"use client";

import { useRouter } from 'next/navigation';
import { CustomButton, CustomGrid } from '@/components/controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { LoadingIndicator } from '@/components/general/LoadingIndicator';
import { GridRowType } from '@/types/interfaces';
import { toDoColumns } from '@/data/modalColumns';
const columns=toDoColumns;
const ToDoListPage = ({ params }: { params:{idActivity: number }}) => {
  const router                                          = useRouter();
  const { data: session }                               = useSession();
  const user                                            = session?.user;
  const [ isLoading, setIsLoading ]                     = useState<boolean>( true );
  const [ selectedRow, setSelectedRow ]                 = useState();
  const [ rows, setRows ]                               = useState<GridRowType[]>([]);
  const [ captionGrid, setCaptionGrid ]                 = useState(''); 

  const idActivity = params?.idActivity ? Number(params.idActivity) : 0;
  //console.log('en ToDoList idActivity', idActivity);
  useEffect(()=>{
    if (!user) return;
    async function fetchData(userId:number) {     
      try {
        //console.log('lee tasks',`/api/getFormData?subMenuId=${subMenuId}`);
        const res = await fetch(`/api/getToDoListTaskUser?userId=${userId} &idProcessidActivity=${idActivity}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch form data: ${res.statusText}`);
        }
        const tasksUser = await res.json();        
        // console.log('tasksUser',tasksUser);
        setRows(tasksUser);
        //setFormData(data);
      } catch (err) {
        console.log('error', err);
      } 
    }
    fetchData(user.id); 
    //setIsLoading(false);
  },[ user, idActivity ])
  useEffect(()=>{
    if (rows && rows.length>0){
      const { nameActivity, processName } =rows[0];      
      setCaptionGrid(`Tareas del proceso: ${processName} y de la actividad: ${nameActivity}` )
      setIsLoading(false);
    }
     //const columnsConfig = generateColumnConfig(rows, excelColumns);
  },[rows])
  const handleRowSelection = (row: any | null) => {
    // console.log('handleRowSelection row',row);
    setSelectedRow(row);
  };
  const handelEdit=(row:any)=>{
      const idTask=String(row.idTask); 
      const ubicacionPanel=row.ubicacionPanel;
      const menu= (ubicacionPanel === 'techo')?'4':'5';
      let newUrl=row.url;//viene de cada actividad
      newUrl=newUrl.replace("${menu}", menu).replace("${idTask}", idTask);      
      router.push(newUrl);
  }
  return (
    <> 
    {/* {console.log('jsx ',captionGrid)} */}
      <div>
      {(isLoading || !rows)?<LoadingIndicator  message='cargando' />
      :
       rows  && (    //alignItems: "center",display: "flex",
        <div style={{justifyContent: "left" ,paddingTop: "15px", paddingLeft: "10px"}}>
          <h1 className="text-3xl font-bold"  >Tus pendientes del proceso </h1>
        { rows && columns && 
        <div style={{ display: "flex",justifyContent: "center" ,paddingTop: "15px", paddingLeft: "10px"}}>
          <div className="p-6" style={{ marginTop: "50px",  width:'80%' }}>       
            <CustomGrid title={captionGrid} columns={columns} data={rows} 
              gridWidth="100%" rowsToShow={10} exportable={false} borderVertical={true} rowHeight="30px" selectable={true}
              onRowSelect={handleRowSelection} fontSize="13px" actions={[ "edit"]}  onEdit={handelEdit} actionsTooltips= {["","Abrir la tarea"]}
              labelButtomActions= {["", "", ""]}
            />
              <CustomButton  
                  buttonStyle="primary" size="small" htmlType="button" label="Volver a página inicial" 
                  icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={() =>  router.push('/') }  //style={{ marginLeft:3, marginBottom:15}}
                  >
              </CustomButton>
            </div>
          </div>
        }
        </div>
       )
      }
      </div>
    </>
    );
};
export default ToDoListPage;