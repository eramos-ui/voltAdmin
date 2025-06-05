'use client';
export const dynamic = 'force-dynamic';

import {  Suspense  } from 'react';
// import { notFound } from "next/navigation"; // 🔹 Importa notFound()
// import { useRouter, useSearchParams  } from 'next/navigation';//

// import { ProjectActivityType } from '@/types/interfaces';
import { LoadingIndicator } from '@/components/general/LoadingIndicator';
// import { CustomButton, CustomFileInput, CustomInput, CustomLabel, CustomRadioGroup} from '@/components/controls';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFloppyDisk, faQuestion, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
// import { numeroATexto } from '@/utils/numeroATexto';
// import { HelperPage } from '@/components/general/Helper';
// import { ModificarProveedorPage } from '@/components/ModificarProveedor';
import CotizarProveedor from './CotizarProveedor';
/**
 * CotizarPage es la página con que el proveedor puede cotizar.
 * e ingresa el token que se le envía por email.
 * <Suspende></Suspende> permite utilizar el useSearchParams para leer el token.
 */

export default function CotizarPage() {
    return( 

    <Suspense fallback={<LoadingIndicator />}>
        <CotizarProveedor />
    </Suspense>
    );
 }