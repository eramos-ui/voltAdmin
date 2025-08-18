export const fetchUserMenu = async (email: string, perfil: string, roleswkf: any[]) => {
    const query = new URLSearchParams({
      email,
      perfil,
      roles: JSON.stringify(roleswkf),
    });  
    // console.log('fetchUserMenu email,perfil',email,perfil);
    const res = await fetch(`/api/user-menu?${query.toString()}`);

    if (!res.ok) throw new Error('Error al cargar el menú del usuario');
    // console.log('fetchUserMenu res.json()',res.json());
    return await res.json();
  };
  