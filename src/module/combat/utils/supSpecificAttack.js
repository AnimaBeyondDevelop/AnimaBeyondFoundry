export const supSpecificAttack = effect => {
  const specificAttack = {
    value: 'none',
    causeDamage: false,
    characteristic: undefined,
    check: false,
    targeted: 'none',
    weakspot: false
  };
  if (/Fuerza[^\d+]+\d+/i.test(effect)) {
    specificAttack.value = 'immobilize';
    specificAttack.characteristic =
      parseInt(effect.match(/Fuerza[^\d+]+\d+/i)[0].match(/\d+/)[0], 10) ?? 0;
    specificAttack.check = true;
  }
  return specificAttack;
};
