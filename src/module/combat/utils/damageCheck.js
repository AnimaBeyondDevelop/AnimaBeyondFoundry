export const damageCheck = effect => {
  effect = effect.replace('.', '');
  if (/Daño *\d+/i.test(effect)) {
    return parseInt(effect.match(/Daño *\d+/i)[0].match(/\d+/)[0], 10) ?? 0;
  } else {
    return 0;
  }
};
