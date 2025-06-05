import { Comuna } from '@/models/Comuna';
import { OptionsSelect } from '@/types/interfaces';
// export type ComunaType = {
//     idComuna: number;
//     descripcion: string;
//     idRegion: number;
//   };

// Caché por región
const comunasPorRegionCache = new Map<number, OptionsSelect[]>();

export async function getComunasOptions(idRegion: number): Promise<OptionsSelect[]> {
  if (comunasPorRegionCache.has(idRegion)) {
    return comunasPorRegionCache.get(idRegion)!;
  }

  try {
    const comunas = await Comuna.find({ idRegion }).sort({ descripcion: 1 }).lean();
    const opciones = comunas.map(c => ({
      value: c.idComuna,
      label: c.descripcion
    }));
    comunasPorRegionCache.set(idRegion, opciones);
    return opciones;
  } catch (error) {
    console.error('❌ Error al cargar comunas:', error);
    return [];
  }
}