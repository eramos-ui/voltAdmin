const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

export const getUsersFullByPerfil = async (perfil: string) => {
    const res = await fetch(`${baseUrl}/api/users/byPerfil?perfil=${encodeURIComponent(perfil)}`);
    if (!res.ok) throw new Error('Error al obtener usuarios por perfil');  
  
    return res.json();
  };
  