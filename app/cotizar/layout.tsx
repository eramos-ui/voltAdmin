export default function CotizarLayout({ children }: { children: React.ReactNode }) {
    return (// podría ir un layout para cotizar
    <div>
         <div className="flex-justify-center" style={{marginLeft:'10%',marginTop:'40px'}} >
            {children}
        </div>
    </div>
  ); 
  }
  