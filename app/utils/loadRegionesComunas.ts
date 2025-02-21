import { Comunas, OptionsSelect } from "@/types/interfaces";
import { fetchOptions } from "./apiHelpers";
import { cargaComunas } from "./cargaComunas";



export const loadRegiones= async () =>{
    const data = await fetchOptions("getRegiones");
    if (data) {
        const regiones:OptionsSelect[]= data; 
        return regiones;        
    }
}

export const loadComunas= async () =>{
    const dataComunas= await cargaComunas();
    if (dataComunas) {
        const comunas:Comunas[]= dataComunas; 
        return comunas;        
    }
}