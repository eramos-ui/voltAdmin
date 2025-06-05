// /app/services/users/getUsersByPerfil.ts
export const getUsersByPerfilForOptions = async (perfil: string) => {
    const res = await fetch(`/api/users/byPerfil?perfil=${encodeURIComponent(perfil)}`);
    // console.log('getUsersByPerfilForOptions',perfil,res);
    if (!res.ok) throw new Error('Error al obtener usuarios por perfil');
    // Transformar a OptionsSelect
    const usuarios=await res.json();
      // console.log('usuarios',usuarios);
    const options = usuarios.map((u:any) => ({
      value: u._id?.toString(),
      label: `${u.name} (${u.user})`
    }));
    // console.log('options',options);
    return options;
  };
  