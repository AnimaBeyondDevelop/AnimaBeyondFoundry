export const damageCheck = gradeDataOrEffect => {
  if (typeof gradeDataOrEffect === 'object' && gradeDataOrEffect !== null) {
    const damageValue = gradeDataOrEffect.damage?.value;
    if (typeof damageValue === 'number') {
      return damageValue;
    }
    if (gradeDataOrEffect.description?.value) {
      return parseDescriptionForDamage(gradeDataOrEffect.description.value);
    }
  }

  if (typeof gradeDataOrEffect === 'string') {
    return parseDescriptionForDamage(gradeDataOrEffect);
  }

  return 0;
};

function parseDescriptionForDamage(effect) {
  effect = effect.replace('.', '');
  if (/Daño *(base)* *\d+/i.test(effect)) {
    return parseInt(effect.match(/Daño *(base)* *\d+/i)[0].match(/\d+/)[0]) ?? 0;
  }
  return 0;
}
