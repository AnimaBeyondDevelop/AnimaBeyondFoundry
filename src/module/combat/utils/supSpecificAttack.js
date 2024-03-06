export const supSpecificAttack = effect => {
  const specificAttack = {
    value: 'none',
    causeDamage: false,
    specialCharacteristic: undefined,
    check: false,
    targeted: 'none',
    weakspot: false,
    openArmor: false
  };
  if (/Fuerza[^\d+]+\d+/i.test(effect)) {
    specificAttack.value = 'immobilize';
    specificAttack.specialCharacteristic =
      parseInt(effect.match(/Fuerza[^\d+]+\d+/i)[0].match(/\d+/)[0], 10) ?? 0;
    specificAttack.check = true;
  }
  return specificAttack;
};
