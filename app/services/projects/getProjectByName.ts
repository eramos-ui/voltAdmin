
export const getProjectByName = async (name: string) => { 
    const res = await fetch(`/api/project/projectByName/${name}`);
    if (!res.ok) throw new Error('Error al obtener el proyecto');
    return await res.json();
  }; 