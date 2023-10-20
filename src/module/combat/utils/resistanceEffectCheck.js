export const resistanceEffectCheck = effect => {
  const resistanceEffect = { value: 0, type: undefined, check: false };
  if (/\d+ RF/.test(effect)) {
    resistanceEffect.check = true;
    resistanceEffect.type = 'physical';
    resistanceEffect.value = parseInt(effect.match(/\d+ RF/)[0].match(/\d+/)[0], 10) ?? 0;
  } else if (/\d+ RE/.test(effect)) {
    resistanceEffect.check = true;
    resistanceEffect.type = 'disease';
    resistanceEffect.value = parseInt(effect.match(/\d+ RE/)[0].match(/\d+/)[0], 10) ?? 0;
  } else if (/\d+ RV/.test(effect)) {
    resistanceEffect.check = true;
    resistanceEffect.type = 'poison';
    resistanceEffect.value = parseInt(effect.match(/\d+ RV/)[0].match(/\d+/)[0], 10) ?? 0;
  } else if (/\d+ RM/.test(effect)) {
    resistanceEffect.check = true;
    resistanceEffect.type = 'magic';
    resistanceEffect.value = parseInt(effect.match(/\d+ RM/)[0].match(/\d+/)[0], 10) ?? 0;
  } else if (/\d+ RP/.test(effect)) {
    resistanceEffect.check = true;
    resistanceEffect.type = 'psychic';
    resistanceEffect.value = parseInt(effect.match(/\d+ RP/)[0].match(/\d+/)[0], 10) ?? 0;
  } else if (/RF \d+/.test(effect)) {
    resistanceEffect.check = true;
    resistanceEffect.type = 'physical';
    resistanceEffect.value = parseInt(effect.match(/RF \d+/)[0].match(/\d+/)[0], 10) ?? 0;
  } else if (/RE \d+/.test(effect)) {
    resistanceEffect.check = true;
    resistanceEffect.type = 'disease';
    resistanceEffect.value = parseInt(effect.match(/RE \d+/)[0].match(/\d+/)[0], 10) ?? 0;
  } else if (/RV \d+/.test(effect)) {
    resistanceEffect.check = true;
    resistanceEffect.type = 'poison';
    resistanceEffect.value = parseInt(effect.match(/RV \d+/)[0].match(/\d+/)[0], 10) ?? 0;
  } else if (/RM \d+/.test(effect)) {
    resistanceEffect.check = true;
    resistanceEffect.type = 'magic';
    resistanceEffect.value = parseInt(effect.match(/RM \d+/)[0].match(/\d+/)[0], 10) ?? 0;
  } else if (/RP \d+/.test(effect)) {
    resistanceEffect.check = true;
    resistanceEffect.type = 'psychic';
    resistanceEffect.value = parseInt(effect.match(/RP \d+/)[0].match(/\d+/)[0], 10) ?? 0;
  }
  return resistanceEffect;
};
