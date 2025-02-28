"use client"; 
import { useEffect, useState } from 'react'; 
import { signOut  } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import UserAvatar from './UserAvatar';
import UserDropdown from './UserDropdown';
import { UserData } from '@/types/interfaces';
// import { useSidebarToggle } from '../../app/components/SidebarToggleContext';
import { useSidebarToggle } from '../../context/SidebarToggleContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import { useLabels } from '@/hooks/ohers/useLabels';
import LogoCompany from './LogoCompany';
import { CustomAlert } from '../controls';
import { compareTwoObj } from '@/utils/compareTwoObj';
import { generateFileHash } from '@/utils/generateFileHash';
import { fetchAvatarAsBlob } from '@/utils/fecthAvatarAsBlob';


type NavbarProps = {
  toggleSidebar: () => void;
  isSidebarVisible: boolean;
  user: UserData | null;
  setUser: (user: UserData) => void;
};

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, isSidebarVisible, user, setUser }) => {
  const { isToggleButtonDisabled }            = useSidebarToggle();
  const [ isDropdownOpen, setIsDropdownOpen ] = useState(false);
  const [ newName, setNewName ]               = useState(user?.name || "");
  const [ newEmail, setNewEmail ]             = useState(user?.email || "");
  const [ newAvatar, setNewAvatar ]           = useState< undefined | File>(undefined);
  const [ avatar, setAvatar ]                 = useState<string | null>();
  const [ newTheme, setNewTheme ]             = useState<'light' | 'dark'>(user?.theme || 'light');
  const router                                = useRouter();
  // const [ newLanguage, setNewLanguage ]       = useState('fr'); 
  const { labels, error }                     = useLabels();
  const [ alertMessage, setAlertMessage ]     = useState<string | null>(null);
  const [ alertType, setAlertType ]           = useState<'success' | 'error' | 'info'>('info'); 

  useEffect(() => {
    if (user) {
      setNewName(user.name);
      setNewEmail(user.email);
      setNewTheme(user.theme || 'light');
      setAvatar(user?.avatar);
    }
  }, [user]);

  const handleLogout =() =>{
    signOut({
      callbackUrl: '/login', // Redirige al usuario a la página de login después del logout
    });
    router.push('/login');
  }
  const handleSetNewAvatar = (file: File | undefined) => {
    //console.log('establece avatar', file);
    if (file) {
      setNewAvatar(file); // Establece el archivo como nuevo avatar
    } else {
      setNewAvatar(undefined); // O restablece el avatar a vacío si es null
    }
  };
  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const handleSave = async () => {//actualiza los cambios
    //console.log(user,jsonData,compareTwoObj(user,jsonData), typeof newAvatar);
    const formData= new FormData();
    formData.append('storedProcedure', 'updateUsuario');
    if (newAvatar) {
      formData.append('avatar', newAvatar); // Solo se agrega si no es null
    } 
    let isNewAvatar:boolean=true;
    if (newAvatar) {
      const newAvatarHash = await generateFileHash(newAvatar);
      if (user?.avatar) {
        const currentAvatarBlob = await fetchAvatarAsBlob(`/api/getAvatar?avatar=${user?.avatar}`);
        const currentAvatarHash = await generateFileHash(currentAvatarBlob);
        // console.log('currentAvatarHash',currentAvatarHash);
        // console.log('currentAvatarBlob',currentAvatarBlob); 
        isNewAvatar= !(currentAvatarHash === newAvatarHash )           
      }
      } else{
        isNewAvatar=false;
      //console.log('newAvatarHash',newAvatarHash); 
    }
    formData.append('parameters', JSON.stringify({...user, name: newName, email: newEmail, theme: newTheme, isNewAvatar: (isNewAvatar)?"1":"0" }));
    //for (let [key, value] of formData.entries()) {  console.log(`${key}:`, value);   }    //verfica el paso de los parametros
    
    if (compareTwoObj(user,{ ...user, name: newName, email: newEmail, theme: newTheme, isNewAvatar }) && !isNewAvatar) return;  
    //('isNewAvatar',isNewAvatar);
    if (isNewAvatar){//con Avatar implica usar formData
      try{
        const response = await fetch('/api/saveUserFormData', {
          method: 'POST',
          body: formData,
        });
        //console.log('response',response);
       } catch(error){
        console.error('JSON inválido:',error);
       }
    } else {//sin avatar se usa post con json
      try {
        const response = await fetch('/api/saveWithJson', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storedProcedure: 'updateUsuario', 
            parameters: { ...user, name: newName, email: newEmail, theme: newTheme, isNewAvatar :'0'}, 
          }),
        });
      
        if (response.ok) {
          const result = await response.json();
            setAlertMessage('Datos actualizados exitosamente');
            setAlertType('success');
            setTimeout(() => {// Actualizar el estado de `user` en Navbar
              if (user) {
                setUser({
                  ...user,
                  name: newName,
                  avatar: typeof newAvatar === 'string' ? newAvatar : user.avatar,
                });
              }
            }, 1000); // Esperar 1 segundo antes de actualizar el estado
          } else {
            const errorData = await response.json();
            console.error('Error saving data:', errorData.error || response.statusText);
            setAlertMessage(`Error al guardar los datos: ${errorData.error || response.statusText}`);
            setAlertType('error');
        }
          } catch (error) {
          console.error('Error saving data:', error);
          setAlertMessage('Error al guardar los datos. Intente nuevamente.');
          setAlertType('error');
          }
    } 
    setIsDropdownOpen(!isDropdownOpen); 
    window.location.href = window.location.href;//recarga la página
    return;
  };
  if (error) {
    return <div>{error}</div>;
  }
  return (
    <> 
    {/* {console.log('en render user',user)} */}
     { labels ? (
        <nav 
          className="bg-gray-800 text-white p-4 flex justify-between items-center dark:bg-gray-900"
        >
          <div className="flex items-center space-x-4">
            <LogoCompany />
            <div className="text-lg">{labels.navbar.appName}</div>
          </div>
          <div className="relative flex items-center space-x-3" >
            {user && (
              <>
                <div className="flex justify-end items-center">                  
                {alertMessage && (
                  <div className="mr-4"> {/* Añadimos un margin-right para separar de los botones */}
                      <CustomAlert
                        duration={2000}
                        message={alertMessage}
                        type={alertType}
                        onClose={() => setAlertMessage(null)}
                      />
                    </div>
                  )}
                  <div className='mr-1'>
                    <UserAvatar avatarFileName={user.avatar} />
                  </div>
                  <UserDropdown
                    user={user}
                    newName={newName}
                    setNewName={setNewName}
                    newEmail={newEmail}
                    setNewEmail={setNewEmail}
                    newTheme={newTheme}
                    setNewTheme={setNewTheme}
                    handleSave={handleSave}
                    handleDropdownToggle={handleDropdownToggle}
                    isDropdownOpen={isDropdownOpen}
                    //newAvatar={ newAvatar }
                    setNewAvatar={handleSetNewAvatar}
                    // newLanguage={newLanguage}
                    // setNewLanguage={setNewLanguage} 
                    disabled={isToggleButtonDisabled}
                  />
                  <button 
                    className="bg-gray-600 text-white ml-1 px-2 py-1 rounded text-sm hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={handleLogout}
                    disabled={isToggleButtonDisabled}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
                    {labels.navbar.botonSalida}
                  </button>
                  <button
                    id="toggle-sidebar-button"
                    className="bg-gray-600 text-white ml-1 px-2 py-1 rounded text-sm hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={toggleSidebar}          
                    disabled={isToggleButtonDisabled }
                  >
                  <FontAwesomeIcon icon={faBars} className="mr-1" />
                   {labels.navbar.menu}
                </button>
                </div>                
              </>
            )}
          </div>
        </nav>
       ): (
        <div>Loading labels...</div>
      )}
    </>
  );
};
export default Navbar;