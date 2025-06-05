export const getUsersFullByPerfil = async (perfil: string) => {
    const res = await fetch(`/api/users/byPerfil?perfil=${encodeURIComponent(perfil)}`);
    if (!res.ok) throw new Error('Error al obtener usuarios por perfil');
  
    return res.json();
  };
  