/**
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 */
export function isMassOfEnemies(actor) {
  return !!actor?.system?.general?.settings?.massOfEnemies?.value;
}

/**
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 */
export function hasDamageAccumulation(actor) {
  return !!actor?.system?.general?.settings?.damageAccumulation?.value;
}

/**
 * Legacy defense type check (pre-migration actors).
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 */
export function isLegacyMassDefense(actor) {
  return actor?.system?.general?.settings?.defenseType?.value === 'mass';
}

/**
 * Legacy defense type check (pre-migration actors).
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 */
export function isLegacyResistanceDefense(actor) {
  return actor?.system?.general?.settings?.defenseType?.value === 'resistance';
}

/**
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 */
export function usesMassDefenseRules(actor) {
  return isMassOfEnemies(actor) || isLegacyMassDefense(actor);
}

/**
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 */
export function usesResistanceDefenseRules(actor) {
  return hasDamageAccumulation(actor) || isLegacyResistanceDefense(actor);
}
