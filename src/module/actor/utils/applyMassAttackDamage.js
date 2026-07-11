import { isMassOfEnemies } from './massSettings.js';

/**
 * +50% to average base physical damage for enemy masses.
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 * @param {number} baseDamage
 */
export function resolveMassPhysicalDamage(actor, baseDamage) {
  const base = Math.max(0, Number(baseDamage) || 0);
  if (!isMassOfEnemies(actor)) return base;

  return Math.floor(base * 1.5);
}

/**
 * Doubles offensive spell or supernatural power base damage for enemy masses.
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 * @param {number} baseDamage
 */
export function resolveMassSupernaturalDamage(actor, baseDamage) {
  const base = Math.max(0, Number(baseDamage) || 0);
  if (!isMassOfEnemies(actor)) return base;

  return base * 2;
}

/**
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 * @param {number} baseDamage
 * @param {number} [specialDamage]
 * @param {{ supernatural?: boolean }} [options]
 */
export function combineMassAttackDamage(
  actor,
  baseDamage,
  specialDamage = 0,
  { supernatural = false } = {}
) {
  const special = Number(specialDamage) || 0;
  const scaled = supernatural
    ? resolveMassSupernaturalDamage(actor, baseDamage)
    : resolveMassPhysicalDamage(actor, baseDamage);

  return special + scaled;
}
