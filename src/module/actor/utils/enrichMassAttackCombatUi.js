import { resolveMassAttackBonus } from './calculateMassAttackBonus.js';
import { isMassOfEnemies } from './massSettings.js';

/**
 * @param {import('../ABFActor').ABFActor | Actor} actor
 * @param {object} modalData
 */
export function enrichMassAttackCombatUi(actor, modalData) {
  const ui = modalData.ui ?? (modalData.ui = {});
  const combat = modalData.attacker?.combat;

  if (!combat || !isMassOfEnemies(actor)) {
    ui.isMassOfEnemies = false;
    return;
  }

  const targetsCount = Array.isArray(modalData.targets) ? modalData.targets.length : 0;
  const defaultTargetCount = Math.max(1, targetsCount || 1);

  ui.isMassOfEnemies = true;

  if (combat.massTargetCount === undefined) {
    combat.massTargetCount = defaultTargetCount;
  }

  const targetCount = Math.max(1, Number(combat.massTargetCount) || defaultTargetCount);
  combat.massTargetCount = targetCount;
  combat.massAttackBonusValue = resolveMassAttackBonus(actor, { targetCount });

  if (combat.massAttackBonusEnabled === undefined) {
    combat.massAttackBonusEnabled = true;
  }
}

/**
 * @param {import('../ABFActor').ABFActor | Actor} actor
 * @param {object} combat
 */
export function getAppliedMassAttackBonus(actor, combat) {
  if (!isMassOfEnemies(actor) || !combat?.massAttackBonusEnabled) return 0;

  const targetCount = Math.max(1, Number(combat.massTargetCount) || 1);
  return resolveMassAttackBonus(actor, { targetCount });
}

/**
 * @param {Record<string, { value: number, apply: boolean }>} attackerCombatMod
 * @param {import('../ABFActor').ABFActor | Actor} actor
 * @param {object} combat
 */
export function applyMassAttackBonusToCombatMod(attackerCombatMod, actor, combat) {
  const massBonus = getAppliedMassAttackBonus(actor, combat);
  if (massBonus) {
    attackerCombatMod.massAttackBonus = { value: massBonus, apply: true };
  }
  return massBonus;
}
