export const calculateDamage = (combatResult: number, damage: number) => {
  const damageRoundedToCeil10Multiplier = Math.ceil(damage / 10) * 10;

  const dealDamage = (damageRoundedToCeil10Multiplier * combatResult) / 100;

  return Math.max(dealDamage, 0);
};