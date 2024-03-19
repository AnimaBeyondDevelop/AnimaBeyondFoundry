export const supSpecificAttack = effect => {
  const specialPorpuseAttack = {
    value: 'none',
    causeDamage: false,
    specialCharacteristic: undefined,
    check: false,
    directed: 'none',
    weakspot: false,
    openArmor: false
  };
  if (/Fuerza[^\d+]+\d+/i.test(effect)) {
    specialPorpuseAttack.value = 'trapping';
    specialPorpuseAttack.specialCharacteristic =
      parseInt(effect.match(/Fuerza[^\d+]+\d+/i)[0].match(/\d+/)[0], 10) ?? 0;
    specialPorpuseAttack.check = true;
  }
  return specialPorpuseAttack;
};
