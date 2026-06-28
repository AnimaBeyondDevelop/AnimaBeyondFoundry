export const shieldValueCheck = gradeDataOrEffect => {
  if (typeof gradeDataOrEffect === 'object' && gradeDataOrEffect !== null) {
    const v = gradeDataOrEffect.shieldPoints?.value;
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v !== '') {
      const parsed = Number(v);
      if (Number.isFinite(parsed)) return parsed;
    }

    if (gradeDataOrEffect.description?.value) {
      const fromDescription = parseShieldPointsFromDescription(
        gradeDataOrEffect.description.value
      );
      if (fromDescription > 0) return fromDescription;
    }

    if (gradeDataOrEffect.value) {
      return parseShieldPointsFromDescription(String(gradeDataOrEffect.value));
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
