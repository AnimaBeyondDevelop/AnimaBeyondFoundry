import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { canCounterAttack } from './canCounterAttack';
import { calculateCounterAttackBonus } from './calculateCounterAttackBonus';
import { calculateDamage } from './calculateDamage';
import { roundTo5Multiples } from './roundTo5Multiples';

export const calculateCombatResult = (
  attack: number,
  defense: number,
  at: number,
  damage: number
): { canCounterAttack: true; counterAttackBonus: number } | { canCounterAttack: false; damage: number } => {
  const needToRound = (game as Game).settings.get('animabf', ABFSettingsKeys.ROUND_DAMAGE_IN_MULTIPLES_OF_5);

  if (canCounterAttack(attack, defense)) {
    return {
      canCounterAttack: true,
      counterAttackBonus: calculateCounterAttackBonus(attack, defense)
    };
  }

  const result = calculateDamage(attack, defense, at, damage);

  return {
    canCounterAttack: false,
    damage: needToRound ? roundTo5Multiples(result) : result
  };
};
