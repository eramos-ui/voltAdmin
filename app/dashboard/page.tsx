// app/dashboard/page.tsx
"use client";

// import Navbar  from '@/app/components/Navbar';
import {  useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserData } from '@/types/interfaces';



type DashboardProps = {
    user: UserData | null;
  };

  const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const router = useRouter();
    const { data: session } = useSession();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    if (session) {
      console.log("User ID:", session.user.id); // Aquí accedes al userId
    }
    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
      };
 /*
 Aquí podría ir:
 1. Resumen de Actividades o Notificaciones
 2. Accesos Rápidos
 3. Estadísticas o Gráficos
 4. Bienvenida y Personalización
 5. Enlaces de Navegación
 6. Estado del Sistema o Mensajes Importantes
 7. Botones de Acción
 El Dashboard puede servir como una página central que ofrece a los usuarios un vistazo rápido a su estado en la aplicación, 
 acceso a funciones clave, o incluso una forma de ver qué es lo más relevante desde la última vez que ingresaron. 
 Aun cuando sea una página de paso, proporcionar valor en el Dashboard puede mejorar la experiencia del usuario y 
 ayudarlo a orientarse en tu aplicación.
 */     
  return (
    <>
      {/* <Navbar toggleSidebar={toggleSidebar} isSidebarVisible={isSidebarVisible} user={ user} />
      <div>
        <h1>Welcome, {session?.user?.name}</h1>
      </div> */}
    </>
  );
};

export default Dashboard;