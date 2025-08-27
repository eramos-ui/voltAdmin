// /app/services/users/getUsersByPerfil.ts

const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
export const getUsersByPerfilForOptions = async (perfil: string) => {
    const res = await fetch(`${baseUrl}/api/users/byPerfil?role=${perfil}`);
    if (!res.ok) {
      return [];
    }
    // Transformar a OptionsSelect
    const usuarios=await res.json();
    const options = usuarios.map((u:any) => ({
      value: u._id?.toString(),
      label: `${u.name} (${u.user})`
    }));
    return options;
  };
  