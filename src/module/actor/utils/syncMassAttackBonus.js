import { resolveMassAttackBonus } from './calculateMassAttackBonus.js';
import { isMassOfEnemies } from './massSettings.js';
import { LIFE_PATH, MEMBER_COUNT_PATH } from './syncMassMemberCount.js';

export const MASS_ATTACK_BONUS_PATH = 'system.general.settings.massAttackBonus.value';

const MASS_ATTACK_BONUS_TRIGGER_PATHS = new Set([
  LIFE_PATH,
  MEMBER_COUNT_PATH,
  'system.general.settings.massOfEnemies.value',
  'system.general.settings.organizedMass.value'
]);

/**
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 * @param {object} [actorChanges]
 */
export function resolveMassAttackBonusForActor(actor, actorChanges = {}) {
  const settings = foundry.utils.deepClone(actor?.system?.general?.settings ?? {});

  for (const [path, value] of Object.entries(actorChanges)) {
    if (!path.startsWith('system.general.settings.')) continue;

    const key = path.slice('system.general.settings.'.length).replace(/\.value$/, '');
    settings[key] = { ...(settings[key] ?? {}), value };
  }

  if (MEMBER_COUNT_PATH in actorChanges) {
    settings.massMemberCount = { value: actorChanges[MEMBER_COUNT_PATH] };
  }

  const massActor = { system: { general: { settings } } };
  if (!isMassOfEnemies(massActor)) return 0;

  return resolveMassAttackBonus(massActor, { targetCount: 1 });
}

/**
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 * @param {object} [actorChanges]
 */
export function buildMassAttackBonusUpdate(actor, actorChanges = {}) {
  const shouldUpdate = [...MASS_ATTACK_BONUS_TRIGGER_PATHS].some(
    path => path in actorChanges
  );

  if (!shouldUpdate) return null;

  return { [MASS_ATTACK_BONUS_PATH]: resolveMassAttackBonusForActor(actor, actorChanges) };
}

/**
 * @param {import('../ABFActor').ABFActor | Actor} actor
 */
export function syncMassAttackBonusOnActor(actor, { persist = false } = {}) {
  if (!isMassOfEnemies(actor)) return;

  const bonus = resolveMassAttackBonusForActor(actor);
  const settings = actor.system?.general?.settings;
  if (!settings?.massAttackBonus) return;

  const current = Number(settings.massAttackBonus.value) || 0;
  if (current === bonus) return;

  settings.massAttackBonus.value = bonus;
  if (persist && typeof actor.updateSource === 'function') {
    actor.updateSource({ [MASS_ATTACK_BONUS_PATH]: bonus });
  }
}

/**
 * @param {object} actorChanges
 * @param {import('../ABFActor').ABFActor | Actor} actor
 */
export function augmentActorChangesWithMassAttackBonus(actorChanges, actor) {
  const update = buildMassAttackBonusUpdate(actor, actorChanges);
  return update ? { ...actorChanges, ...update } : actorChanges;
}
