import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { canCounterAttack } from './canCounterAttack';
import { calculateCounterAttackBonus } from './calculateCounterAttackBonus';
import { calculateDamage } from './calculateDamage';
import { roundTo5Multiples } from './roundTo5Multiples';

export const calculateCombatResult = (
  attack: number,
  defense: number,
  at: number,
  damage: number,
  halvedAbsorption: boolean = false
): { canCounterAttack: true; counterAttackBonus: number } | { canCounterAttack: false; damage: number; nonLethalDamage: number } => {
  const needToRound = (game as Game).settings.get('animabf', ABFSettingsKeys.ROUND_DAMAGE_IN_MULTIPLES_OF_5);

  if (canCounterAttack(attack, defense)) {
    return {
      canCounterAttack: true,
      counterAttackBonus: calculateCounterAttackBonus(attack, defense)
    };
  }

  const result = calculateDamage(attack, defense, at, damage, halvedAbsorption);

  return {
    canCounterAttack: false,
    damage: needToRound ? roundTo5Multiples(result) : result,
    nonLethalDamage: needToRound ? roundTo5Multiples(Math.floor(result/2)) : Math.floor(result/2),
  };
};
