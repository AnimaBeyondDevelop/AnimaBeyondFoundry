import { floorToMultiple } from '@utils/rounding';

/**
 * @param {number} attack
 * @param {number} defense
 */
export const calculateCounterAttackBonus = (attack, defense) => {
  return Math.min(floorToMultiple((defense - attack) / 2, 5), 150);
};
