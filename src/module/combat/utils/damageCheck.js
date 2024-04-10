export const damageCheck = effect => {
  effect = effect.replace('.', '');
  if (/Daño *(base)* *\d+/i.test(effect)) {
    return parseInt(effect.match(/Daño *(base)* *\d+/i)[0].match(/\d+/)[0]) ?? 0;
  } else {
    return 0;
  }
};
