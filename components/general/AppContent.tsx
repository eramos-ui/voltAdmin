//Aquí se obtiene el menú del usuario y se renderiza el contenido de la página
"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSidebarToggle } from '../../context/SidebarToggleContext';
import Navbar from './Navbar';
import { UserData, MenuItem } from '../../types/interfaces';
import Sidebar from './Sidebar';
import { LoadingIndicator } from './LoadingIndicator'; 
import { fetchUserMenu } from '@/lib/users/fetchUserMenu';

const AppContent = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status }                   = useSession();
  const router                                      = useRouter();
  const pathname                                    = usePathname();
  const [ user, setUser ]                           = useState<UserData | null>(null);
  const [ isSidebarVisible, setIsSidebarVisible ]   = useState(false);
  const { disableToggleButton, enableToggleButton } = useSidebarToggle();
  const [ loading, setLoading ]                     = useState(true);
  const [ menuData, setMenuData ]                   = useState<MenuItem[] | null>(null);
 
  // console.log('AppContent');
  useEffect(() => {   
    //console.log('1 en useEffect status',status,pathname);
    if (status === 'loading') {
      setLoading(true);
    } else if (
      status === 'unauthenticated' &&
      pathname !== '/login' &&
      pathname !== '/register' &&
      pathname !== '/forgot-password' &&
      pathname !== '/reset-password'
    ) {
      router.push('/login'); 
    } else if (
      status === 'unauthenticated' &&
      (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password'  || pathname === '/reset-password')
    ) {
      //console.log('2 en useEffect status',status,pathname);
      setLoading(false);
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, session, pathname, router]);

   
  const fetchUserData = async (userId: string) => {
     if (!userId) return;
     try {
      // console.log('AppContent fetchUserData', `/api/usuarios/${userId}`);
      const response = await fetch(`/api/usuarios/${userId}`);///api/usuarios/6800ff9cb9b53ba220c73996
      if (response.ok) {//obtiene los datos del usuario vía el _id
        const userData = await response.json();  
        //const userData = await response.json();        
        setUser({
            ...userData,
            theme:userData.theme, 
            avatar: userData.avatar,  
        });
      } else {
        console.error('Failed to fetch user data');
      }
     } catch (error) {
       console.error('Error fetching user data:', error);
     }
  }; 
  useEffect (()=>{
    if (session && session.user.id  ){
      const userId=session.user.id;
      // console.log('session',session,userId);
      fetchUserData(userId);
    }
  },[session])

  useEffect(() => {
      // Deshabilitar el botón en todas las páginas excepto el Home
      if (pathname !== '/') {
          disableToggleButton();
        } else {
          enableToggleButton();
        }
    }, [pathname, disableToggleButton, enableToggleButton]);
  const toggleSidebar = () => {
      // console.log('toggleSidebar')
      setIsSidebarVisible(!isSidebarVisible);
   };
  // useEffect(() => {
  //   console.log('AppContent useEffect menuData',menuData);
  // }, [menuData]);
  useEffect(() => {//Aquí se obtiene el menú del usuario  
    if (user?.email && user?.perfil && user?.roleswkf) {
      // console.log('AppContent useEffect user',user);
      fetchUserMenu(user.email, user.perfil, user.roleswkf)
        .then(setMenuData)
        .catch(console.error);
    }
  }, [user]);
  if (loading ) {
    return <LoadingIndicator  message='cargando' />; // Mostrar un indicador de carga mientras se determina la autenticación
  }
  // console.log('en AppContent render user',user)
  return (
    <>
        <Navbar toggleSidebar={toggleSidebar}  user={(pathname === '/login') ? null:user} setUser={setUser} />
        <div className="flex">
         <Sidebar isVisible={isSidebarVisible} closeSidebar={() => setIsSidebarVisible(false)} user={user!} menuData={menuData} />
         <main className={`flex-1 transition-all duration-300 ${isSidebarVisible ? 'blur-md' : ''}`}> {children} </main>
        </div>
      </>
  ) };

export default AppContent;
