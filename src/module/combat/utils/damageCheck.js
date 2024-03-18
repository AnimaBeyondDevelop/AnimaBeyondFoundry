export const damageCheck = effect => {
  if (/Daño[^automático\d]*\d+/i.test(effect)) {
    return parseInt(effect.match(/Daño[^automático\d]*\d+/i)[0].match(/\d+/)[0], 10) ?? 0;
  } else {
    return 0;
  }
};
