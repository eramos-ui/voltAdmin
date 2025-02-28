import { fetchRecordSetFromSP } from "./apiHelpers";

//import comunasLtLng from '../../../data/comunas.json'; //../data/comunas.json
export const cargaComunas= async () =>{
    const spFetchOptions=`comunasPorRegion`;
    const data = await fetchRecordSetFromSP(spFetchOptions);
    return data;
}
      