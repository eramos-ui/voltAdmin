//Página de inicio de la aplicación
"use client";  
import { useSession } from 'next-auth/react';   
import { FaProjectDiagram, FaIndustry, FaDollarSign, FaCalendarAlt, FaFileAlt, FaGavel, FaCalculator, FaCheckCircle, FaCogs, FaChartLine, 
          FaUsers, FaAward, FaGraduationCap, FaLifeRing, FaUserCog } from "react-icons/fa";
export default function HomePage() { 
  const { data: session, status }                   = useSession();
  const userName=session?.user.name;
  const menuOptions = [
    { title: "Proyectos", description: "Gestión y seguimiento de proyectos solares fotovoltáicos.", icon: <FaProjectDiagram /> },
    { title: "Proveedores", description: "Explora y contacta proveedores de productos y servicios, .", icon: <FaIndustry /> },
    // { title: "Financiamiento", description: "Opciones de financiamiento para tus proyectos.", icon: <FaDollarSign /> },
    // { title: "Cronogramas", description: "Planifica y organiza tareas con cartas Gantt.", icon: <FaCalendarAlt /> },
    { title: "Cronogramas", description: "Planifica y organiza cada tareas asignando responsables y plazos.", icon: <FaCalendarAlt /> },
    // { title: "Documentación", description: "Accede a plantillas y documentos estandarizados.", icon: <FaFileAlt /> },
    // { title: "Normativas", description: "Consulta regulaciones y normativas del sector.", icon: <FaGavel /> },
    { title: "Costos y presupuestos", description: "Herramientas para controlar costos de cada actividad.", icon: <FaCalculator /> },
    { title: "Validación de entregables", description: "Verifica y certifica el cumplimiento de los requisitos, tanto de los proveedores como de los ejecutores internos.", icon: <FaCheckCircle /> },
    // { title: "Materiales y equipos", description: "Base de datos de insumos técnicos y especificaciones.", icon: <FaCogs /> },
    { title: "Métricas y reportes", description: "Generación de reportes de desempeño y cumplimiento.", icon: <FaChartLine /> },
    // { title: "Comunidad", description: "Foros y espacios de discusión para profesionales del sector.", icon: <FaUsers /> },
    { title: "Alertas", description: "Envía alertas a los usuarios y proveedores para que sepan lo que tiene pendiente.", icon: <FaUsers /> },
    // { title: "Casos de éxito", description: "Ejemplos de proyectos exitosos y lecciones aprendidas.", icon: <FaAward /> },
    // { title: "Capacitación", description: "Recursos educativos y formación en energías renovables.", icon: <FaGraduationCap /> },
    // { title: "Soporte técnico", description: "Asistencia y resolución de problemas técnicos.", icon: <FaLifeRing /> },
    { title: "Perfil y configuración", description: "Gestiona tu cuenta y preferencias definiendo usuarios, roles y permisos, así como definir a tus proveedores.", icon: <FaUserCog /> }
  ];
  //console.log('FormPage themeClass',session?.user);
  //className={`relative p-6 rounded-lg shadow-lg max-w-full mx-auto mt-8 ${themeClass}`}
  return (
    <div className={`p-6 dark`}>
    <h1 className="text-4xl font-bold mb-4">Bienvenido a la Plataforma</h1>
    <p className="text-lg mb-6">
      Hola <strong>{userName}</strong>.     
    </p>
   <p className="text-lm mt-1 mb-3">Explora las diferentes secciones de la plataforma y accede a herramientas clave para la gestión de proyectos solares fotovoltáicos. </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
      {menuOptions.map((option, index) => (
        <div key={index} className="p-4 border rounded-lg shadow-md hover:shadow-lg transition">
          <div className="text-3xl text-blue-600">{option.icon}</div>
          <h2 className="text-xl font-semibold mb-2">{option.title}</h2>
          <p className="text-gray-700">{option.description}</p>
        </div>
      ))}
    </div>
  </div>
  );
}