export const calculateDamage = (attack: number, defense: number, at: number, damage: number) => {
  const damageRoundedToCeil10Multiplier = Math.ceil(damage / 10) * 10;
  const combatResult = Math.floor((attack - (defense + at * 10 + 20)) / 10) * 10;

  const dealDamage = (damageRoundedToCeil10Multiplier * combatResult) / 100;

  return Math.max(dealDamage, 0);
};