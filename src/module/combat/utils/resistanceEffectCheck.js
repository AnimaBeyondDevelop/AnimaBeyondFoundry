export const resistanceEffectCheck = effect => {
  const resistanceEffect = { value: 0, type: undefined, check: false };
  const resistances = { physical: 'RF', disease: 'RE', poison: 'RV', magic: 'RM', psychic: 'RP' }

  function updateResistanceEffect(type, regExp) {
    resistanceEffect.check = true;
    resistanceEffect.type = type;
    resistanceEffect.value = parseInt(effect.match(regExp)[0].match(/\d+/)[0]) ?? 0;
  }

  for (const key in resistances) {
    if (!resistanceEffect.check) {
      let beforeResistance = new RegExp(`\\d+ *[RFEVMP]{0,2} *o* *${resistances[key]}`, 'i')
      let afterResistance = new RegExp(`${resistances[key]} *o* *[RFEVMP]{0,2} *\\d+`, 'i')

      if (beforeResistance.test(effect)) {
        updateResistanceEffect(key, beforeResistance)
      } else if (afterResistance.test(effect)) {
        updateResistanceEffect(key, afterResistance)
      }
    }
  }

  return resistanceEffect;
};
