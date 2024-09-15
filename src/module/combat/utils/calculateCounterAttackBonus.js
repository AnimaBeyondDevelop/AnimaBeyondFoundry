/** @param {number} value */
const roundCounterAttack = value => Math.floor(value / 5) * 5;

/**
 * @param {number} attack
 * @param {number} defense
 */
export const calculateCounterAttackBonus = (attack, defense) => {
  return Math.min(roundCounterAttack((defense - attack) / 2), 150);
};
