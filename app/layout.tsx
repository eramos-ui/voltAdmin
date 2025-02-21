
"use client";  

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import Modal from 'react-modal';

import { ThemeProvider } from './ThemeContext';
import { SidebarToggleProvider } from './components/SidebarToggleContext';

import './styles/globals.css';
import AppContent from './components/AppContent';
import { MapProvider, PlacesProvider } from './context';
import { usePathname } from 'next/navigation';
import CotizarLayout from "./cotizar/layout"; 

import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken= process.env.NEXT_PUBLIC_AcCESS_token  ;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname                                    = usePathname();
  const isCotizarPage = pathname?.startsWith("/cotizar");
  //console.log('layout general',pathname,isCotizarPage);
  // useEffect(() => {//Modal.setAppElement('#__next'); // o '#__next' según la estructura de tu DOM
  //   Modal.setAppElement('body'); // Cambia a 'body' si '#__next' no funciona
  // }, []);
  return (
    <html lang="en">
       <body>
        <ThemeProvider>
          {!isCotizarPage ? ( // 🔹 Solo renderiza Providers en rutas normales
            <PlacesProvider>
              <MapProvider>
                <SidebarToggleProvider>
                  <SessionProvider>
                    <AppContent>{children}</AppContent>
                  </SessionProvider>
                </SidebarToggleProvider>
              </MapProvider>
            </PlacesProvider>
          ) : (
            <CotizarLayout>{children}</CotizarLayout> // 🔹 En `/cotizar`, usa layout sin providers extra
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
