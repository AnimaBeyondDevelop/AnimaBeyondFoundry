export const resistanceEffectCheck = gradeDataOrEffect => {
  if (typeof gradeDataOrEffect === 'object' && gradeDataOrEffect !== null) {
    const resEffect = gradeDataOrEffect.resistanceEffect;
    if (resEffect && typeof resEffect.value === 'number' && resEffect.type) {
      return {
        value: resEffect.value,
        type: resEffect.type,
        check: resEffect.value > 0
      };
    }
    if (gradeDataOrEffect.description?.value) {
      return parseDescriptionForResistance(gradeDataOrEffect.description.value);
    }
  }

  if (typeof gradeDataOrEffect === 'string') {
    return parseDescriptionForResistance(gradeDataOrEffect);
  }

  return { value: 0, type: undefined, check: false };
};

function parseDescriptionForResistance(effect) {
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
}
