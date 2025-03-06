import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { canCounterAttack } from './canCounterAttack';
import { calculateCounterAttackBonus } from './calculateCounterAttackBonus';
import { calculateDamage } from './calculateDamage';
import { floorTo5Multiple } from '@utils/rounding';

// TODO: Relplace this with the new implementation in CombatResultsCalculator, and remove this
// and required files
/**
 * @param {number} attack
 * @param {number} defense
 * @param {number} at
 * @param {number} damage
 * @param {boolean} [halvedAbsorption]
 * @returns {{ canCounterAttack: true; counterAttackBonus: number } | { canCounterAttack: false; damage: number }}
 */
export const calculateCombatResult = (
  attack,
  defense,
  at,
  damage,
  halvedAbsorption = false
) => {
  const needToRound = game.settings.get(
    'animabf',
    ABFSettingsKeys.ROUND_DAMAGE_IN_MULTIPLES_OF_5
  );

  if (canCounterAttack(attack, defense)) {
    return {
      canCounterAttack: true,
      counterAttackBonus: calculateCounterAttackBonus(attack, defense)
    };
  }

  const result = calculateDamage(attack, defense, at, damage, halvedAbsorption);

  return {
    canCounterAttack: false,
    damage: needToRound ? floorTo5Multiple(result) : result
  };
};
