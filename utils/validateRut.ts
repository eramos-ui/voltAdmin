export const validateRUT = (value: string) => {
    const rut = value.replace(/\./g, '').replace('-', '');
    const body = rut.slice(0, -1);
    if (body.length <7 ){
      return 'RUT inválido. Debe tener mínimo 7 dígitos.';
    }
    const dv = rut.slice(-1).toUpperCase();
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const mod = 11 - (sum % 11);
    let expectedDv;
    if (mod === 11) {
      expectedDv = '0';
    } else if (mod === 10) {
      expectedDv = 'K';
    } else {
      expectedDv = mod.toString();
    }
    if (expectedDv !== dv) {
      return 'RUT inválido';
    }
    return '';
  };