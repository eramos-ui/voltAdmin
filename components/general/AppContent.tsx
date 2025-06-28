//este es un componente del Layout de la aplicación
//Aquí se obtiene el menú del usuario y se renderiza el contenido de la página
"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSidebarToggle } from '../../context/SidebarToggleContext';
import Navbar from './Navbar';
// import { UserData, MenuItem } from '../../types/interfaces';
import Sidebar from './Sidebar';
import { Footer } from './Footer';  
import { LoadingIndicator } from './LoadingIndicator'; 
// import { fetchUserMenu } from '@/lib/users/fetchUserMenu';
import { useMenu } from '@/context/MenuContext';

const AppContent = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status }                   = useSession();
  const router                                      = useRouter();
  const pathname                                    = usePathname();
  //const [ user, setUser ]                           = useState<UserData | null>(null);
  const [ isSidebarVisible, setIsSidebarVisible ]   = useState(false);
  const { disableToggleButton, enableToggleButton } = useSidebarToggle();
  const [ loading, setLoading ]                     = useState(true);
  // const [ menuData, setMenuData ]                   = useState<MenuItem[] | null>(null);
  const { menuData, refreshMenu, setUser: setUserInContext, user } = useMenu();

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

   
  // const fetchUserData = async (userId: string) => {
  //    if (!userId) return;
  //    try {
  //     // console.log('AppContent fetchUserData', `/api/usuarios/${userId}`);
  //     const response = await fetch(`/api/usuarios/${userId}`);///api/usuarios/6800ff9cb9b53ba220c73996
  //     if (response.ok) {//obtiene los datos del usuario vía el _id
  //       const userData = await response.json();  
  //       setUserInContext({
  //         ...userData,
  //         theme: userData.theme,
  //         avatar: userData.avatar,
  //       });
  //       refreshMenu();               // ✅ Aquí fuerza la carga del menú
  //     } else {
  //       console.error('Failed to fetch user data');
  //     }
  //    } catch (error) {
  //      console.error('Error fetching user data:', error);
  //    }
  // }; 
  
  useEffect(() => {
    const fetchUserData = async (userId: string) => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/usuarios/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setUserInContext({
            ...userData,
            theme: userData.theme,
            avatar: userData.avatar,
          });
          refreshMenu();
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    if (session?.user?.id) {
      fetchUserData(session.user.id);
    }
  }, [session, setUserInContext, refreshMenu]);

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

  if (loading ) {
    return <LoadingIndicator  message='cargando' />; // Mostrar un indicador de carga mientras se determina la autenticación
  }
  // console.log('en AppContent render user',user)
  return (
    <>
        <Navbar 
          toggleSidebar={toggleSidebar}  // user={(pathname === '/login') ? null:user} setUser={setUser} 
        />
        <div className="flex">
         <Sidebar isVisible={isSidebarVisible} closeSidebar={() => setIsSidebarVisible(false)} user={user!} menuData={menuData} />
         <main className={`flex-1 transition-all duration-300 ${isSidebarVisible ? 'blur-md' : ''}`}> {children} </main>
        </div>
        <Footer />
      </>
  ) };

export default AppContent;
