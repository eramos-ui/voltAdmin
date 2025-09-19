
"use client";

import { useRouter } from 'next/navigation';
import { CustomButton } from '@/components/controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEraser, faHome } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

function Spinner() {
    return (
      <span
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.125em]"
        aria-label="cargando"
        role="status"
      />
    );
  }
const ResetPage = () => {
  const router = useRouter();
  const [busy, setBusy]     = useState(false);//Deshabilitar los botones mientras se hace la petición (evita dobles clics y operaciones duplicadas).
  const [result, setResult] = useState<any>(null);
  const run = async (dryRun: boolean) => {
    const ok1 = window.confirm(dryRun ? "¿Simular limpieza de los datos?" : "¿Ejecutar limpieza REAL?");
    if (!ok1) return;
    const text = prompt("Escribe BORRAR para confirmar:");
    if (text !== "BORRAR") return alert("Confirmación inválida.");

    setBusy(true);
    try {
      const r = await fetch("/api/admin/reset-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_ADMIN_RESET_TOKEN ?? ""}`, // o usa sesión/rol
        },
        body: JSON.stringify({ confirm: "BORRAR", dryRun }),
      });
      const j = await r.json();
      setResult(j);
      if (!j.ok) alert(`Error: ${j.error || "falló"}`);
    } catch (e: any) {
      alert(e?.message || "Error de red");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Reset data para nueva presentación</h1>
      <>
       {/* <div className="flex items-center gap-2">
            <CustomButton disabled={busy}
                size="small" htmlType="button" label="Simulación" style={{ marginLeft:3, marginTop:15, backgroundColor:'white',color:'black' }}
                icon={<FontAwesomeIcon icon={faEraser} size="lg"  />} onClick={() => run(true) } 
                tooltipContent='Esto simulará lo que implica borrarlos datos de la presentación' tooltipPosition='bottom'
            > 
            </CustomButton>
            <CustomButton disabled={busy}
                size="small" htmlType="button" label="Reset DEMO" style={{ marginLeft:3, marginTop:15, backgroundColor:'red' }}
                icon={<FontAwesomeIcon icon={faEraser} size="lg" color="white" />} onClick={() =>  run(false) } 
                tooltipContent='Esto eliminará los datos de la presentación' tooltipPosition='bottom'
            > 
                    
            </CustomButton>
            {result && (
                <pre className="text-xs bg-gray-100 p-2 rounded max-h-64 overflow-auto">
                {JSON.stringify(result, null, 2)}
                </pre>
            )}
       </div> */}
                
        <div className="flex items-center gap-2">
            <button disabled={busy} onClick={() => run(true)} className="px-3 py-1 border rounded">
                Simulación
            </button>
            <button disabled={busy} onClick={() => run(false)} className="px-3 py-1 border rounded bg-red-600 text-white">
                {busy && <Spinner />}
                {busy ? "Procesando..." : "Reset DEMO"}
            </button>
            {result && (
                <pre className="text-xs bg-gray-100 p-2 rounded max-h-64 overflow-auto">
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </div>
                
        <CustomButton
            buttonStyle="primary" size="small" htmlType="button" label="Volver a página inicial" style={{ marginLeft:13, marginTop:15 }}
            icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={() =>  router.push('/') } 
        > 
        </CustomButton>
      </>
    </div>
  );
};

export default ResetPage;