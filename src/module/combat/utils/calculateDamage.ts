export const calculateDamage = (attack: number, defense: number, at: number, damage: number) => {
  const damageRoundedToCeil5Multiplier = Math.ceil(damage / 10) * 10;

  const dealDamage = (damageRoundedToCeil5Multiplier * (attack - (defense + at * 10 + 20))) / 100;

  return Math.max(dealDamage, 0);
};
