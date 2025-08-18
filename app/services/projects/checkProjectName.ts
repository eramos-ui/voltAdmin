// lib/checkProjectName.ts
export async function checkProjectName(name: string): Promise<{ available: boolean }> {
    if (!name?.trim()) return { available: false };
  
    const res = await fetch(`/api/projects/exists?name=${encodeURIComponent(name)}`, {
      method: 'GET',
      cache: 'no-store', // evita caché en Next.js
    });
  
    if (res.status === 204) return { available: true };              // contrato 204
    if (res.status === 409) return { available: false };             // duplicado
    if (res.ok) {
      // por si usas 200 {exists: boolean}
      const data = await res.json().catch(() => ({}));
      return { available: !data?.exists };
    }
    // en error del server, mejor no bloquear al usuario
    return { available: false };
  }
  