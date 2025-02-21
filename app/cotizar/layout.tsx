export default function CotizarLayout({ children }: { children: React.ReactNode }) {
   //Sin html ni body nextjs no acepta 2  
   return (
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-8xl w-full">
            {children} {/* Renderiza la página de cotización */}
          </div>
    );
  }
  