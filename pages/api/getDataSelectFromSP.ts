//Ejecuta una API que es vía un SP
import { OptionsSelect } from '@/types/interfaces';
export const fetchDataSelectFromSP = async (spName: string): Promise<OptionsSelect> => {
    try {

      const response = await fetch('/api/execSP', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storedProcedure: spName,
          parameters: {},
        }),
      });          
      if (response.ok) {
        const data = await response.json();
        const formattedOptions = data.map((item: any) => ({
          id: item.id, // Ajusta estos campos según tu resultset
          label: item.label, // Ajusta estos campos según tu resultset
        }));
        const optionsSelect:OptionsSelect=formattedOptions;
        //console.log('optionsSelect',optionsSelect);
        return optionsSelect;
      } else {
        console.error('Error al obtener las opciones');
        throw 'error' ;
      }
   

    } catch (error) {
      console.error('Error fetching menu data:', error);
      throw error; // Lanza el error para manejarlo en el componente que llama a esta función
    }
  }; 