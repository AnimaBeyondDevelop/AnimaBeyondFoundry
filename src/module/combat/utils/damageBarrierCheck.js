export const damageBarrierCheck = effect => {
  if (/barrera de daño \d+/i.test(effect)) {
    return parseInt(effect.match(/barrera de daño \d+/i)[0].match(/\d+/)[0]) ?? 0;
  }
  return 0;
};
