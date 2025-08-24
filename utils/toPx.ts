/*
conviente pixeles de nnpx a nn
*/
export const toPx=(h: number | string | undefined, fallback = 44): number => {
    if (h == null) return fallback;
    if (typeof h === 'number') return h;      // ya viene en px
    const n = Number.parseFloat(h);           // "24px" -> 24
    return Number.isFinite(n) ? n : fallback; // manejo seguro
  }