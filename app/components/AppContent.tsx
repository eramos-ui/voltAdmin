"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSidebarToggle } from '../components/SidebarToggleContext';
import Navbar from './Navbar';
import { MenuConfig, UserData } from '@/types/interfaces';
import Sidebar from './Sidebar';
import { fetchMenuData } from '../utils/fetchMenuData';
import { LoadingIndicator } from './LoadingIndicator'; 



const AppContent = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status }                   = useSession();
  const router                                      = useRouter();
  const pathname                                    = usePathname();
  const [ user, setUser ]                           = useState<UserData | null>(null);
  const [ isSidebarVisible, setIsSidebarVisible ]   = useState(false);
  const { disableToggleButton, enableToggleButton } = useSidebarToggle();
  const [ loading, setLoading ]                     = useState(true);
  const [ menuData, setMenuData ]                   = useState<MenuConfig | null>(null);
  // console.log('AppContent');
  useEffect(() => {   
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
      setLoading(false);
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, session, pathname, router]);

   
   const fetchUserData = async (userId: number) => {
     try {
          const response = await fetch(`/api/getUser?userId=${userId}`);
          if (response.ok) {
            const userData = await response.json();        
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
    if (session ){
        const userId=session.user.id;
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
   useEffect(() => {
    if (user ) {
      const fetchData = async () => {
        const data= await fetchMenuData(user.id);
        //console.log('menú data en el AppContent',data)
        setMenuData(data);
      };
      fetchData();
    }
  }, [user ]);

  if (loading ) {
    return <LoadingIndicator  message='cargando' />; // Mostrar un indicador de carga mientras se determina la autenticación
  }
  return (
      <>
        
        <Navbar toggleSidebar={toggleSidebar} isSidebarVisible={isSidebarVisible} user={user} setUser={setUser} />
        <div className="flex">
         <Sidebar isVisible={isSidebarVisible} closeSidebar={() => setIsSidebarVisible(false)} user={user!} menuData={menuData} />
         <main className={`flex-1 transition-all duration-300 ${isSidebarVisible ? 'blur-md' : ''}`}> {children} </main>
        </div>
      </>
  ) };

export default AppContent;