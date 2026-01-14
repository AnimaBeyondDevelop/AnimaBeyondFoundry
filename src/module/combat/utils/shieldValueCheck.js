export const shieldValueCheck = gradeDataOrEffect => {
  if (typeof gradeDataOrEffect === 'object' && gradeDataOrEffect !== null) {
    const v = gradeDataOrEffect.shieldPoints?.value;
    if (typeof v === 'number') return v;

    if (gradeDataOrEffect.description?.value) {
      return parseShieldPointsFromDescription(gradeDataOrEffect.description.value);
    }
  }

  if (typeof gradeDataOrEffect === 'string') {
    return parseShieldPointsFromDescription(gradeDataOrEffect);
  }

  return 0;
};

function parseShieldPointsFromDescription(effect) {
  effect = effect.replace('.', '');
  if (/\d+ puntos de resistencia/i.test(effect)) {
    return parseInt(effect.match(/\d+ puntos de resistencia/i)[0].match(/\d+/)[0]) ?? 0;
  } else if (/\d+ PV/i.test(effect)) {
    return parseInt(effect.match(/\d+ PV/i)[0].match(/\d+/)[0]) ?? 0;
  } else {
    return 0;
  }
}
