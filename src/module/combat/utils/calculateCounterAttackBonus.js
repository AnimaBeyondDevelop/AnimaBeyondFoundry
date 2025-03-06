import { floorTo5Multiple } from '@utils/rounding';

/**
 * @param {number} attack
 * @param {number} defense
 */
export const calculateCounterAttackBonus = (attack, defense) => {
  return Math.min(floorTo5Multiple((defense - attack) / 2), 150);
};
