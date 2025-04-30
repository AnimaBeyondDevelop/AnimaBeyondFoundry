export const damageCheck = effect => {
  effect = effect.replace('.', '');
  if (/barrera de daño/i.test(effect)) {
    return 0;
  }
  if (/Daño *(base)* *\d+/i.test(effect)) {
    return parseInt(effect.match(/Daño *(base)* *\d+/i)[0].match(/\d+/)[0]) ?? 0;
  }
  return 0;
};
