
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomButton, CustomInput, CustomLabel } from "../controls";
import CustomModal from "../general/CustomModal";
import { faFloppyDisk, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

type ModificarProveedorProps = {
    openModificar:boolean;  
    handleCloseModal:() => void;
    razonSocial: string;
    contacto:string;
    email:string;
    idProveedor: number;
  
  };


export const ModificarProveedorPage: React.FC<ModificarProveedorProps>  =  ({openModificar, handleCloseModal, razonSocial, contacto, email, idProveedor }   )=> {
if (!openModificar) return;
//const [ razonSocial, setRazonSocial ]     =useState('');
// console.log('helpData',nroHelpers,helpData,help);

return (
  <CustomModal isOpen={openModificar} onClose={handleCloseModal} height='45vh'  title={'Modificar atributos del proveedor'} width="33%"
    //position='right'
  >
    <CustomInput label='Razón social'  captionPosition='left' placeholder='Modifique la razón social de su empresa'
        type='text' value={razonSocial} width='300px' tooltipContent='Ingrese la razón social de su empresa' tooltipPosition='top'
    />
   <CustomInput label='Contacto' captionPosition='left' placeholder='Modifique el contacto de su empresa'
        type='text' value={contacto} width='300px' tooltipContent='Ingrese el contacto de su empresa' tooltipPosition='top'
    />
   <CustomInput label='Email' captionPosition='left' placeholder='Modifique el email del contacto'
        type='text' value={email} width='300px' tooltipContent='Ingrese el email del contacto de su empresa' tooltipPosition='top'
    />
    <div className="mt-3 flex items-start ">
      <CustomButton label='Salir sin actualizar' buttonStyle="primary" size="small" icon={<FontAwesomeIcon icon={faSignOutAlt} size="lg" color="white" />} >
      </CustomButton>
      <CustomButton label='Actualizar' buttonStyle="primary" size="small" style={{ marginLeft:5 }} icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} >
      </CustomButton>
    </div>
  </CustomModal>
  )
}