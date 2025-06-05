// lib/cache/catalogos.ts

// import { Region } from '@/models/Region';
// import { Comuna } from '@/models/Comuna';

// export interface OptionsSelect {
//   value: string | number;
//   label: string;
// }

// // === REGIONES ===
// export type RegionType = {
//   descripcion: string;
//   romano: string;
//   idRegion: number;
// };

// let regionCache: RegionType[] | null = null;

// export async function getRegiones(): Promise<RegionType[]> {
//   if (regionCache) return regionCache;

//   try {
//     regionCache = (await Region.find({}).sort({ idRegion: 1 }).lean()).map(r => ({
//         descripcion: r.descripcion,
//         romano: r.romano,
//         idRegion: r.idRegion
//       }));
//     return regionCache;
//   } catch (error) {
//     console.error('❌ Error al cargar regiones:', error);
//     return [];
//   }
// }

// export async function getRegionesOptions(): Promise<OptionsSelect[]> {
//   const regiones = await getRegiones();
//   return regiones.map(r => ({
//     value: r.idRegion,
//     label: r.descripcion
//   }));
// }

// export function clearRegionCache() {
//   regionCache = null;
// }

// // === COMUNAS ===
// const comunasPorRegionCache = new Map<number, OptionsSelect[]>();

// export async function getComunasOptions(idRegion: number): Promise<OptionsSelect[]> {
//   if (comunasPorRegionCache.has(idRegion)) {
//     return comunasPorRegionCache.get(idRegion)!;
//   }

//   try {
//     const comunas = await Comuna.find({ idRegion }).sort({ descripcion: 1 }).lean();
//     const opciones = comunas.map(c => ({
//       value: c.idComuna,
//       label: c.descripcion
//     }));
//     comunasPorRegionCache.set(idRegion, opciones);
//     return opciones;
//   } catch (error) {
//     console.error('❌ Error al cargar comunas:', error);
//     return [];
//   }
// }
