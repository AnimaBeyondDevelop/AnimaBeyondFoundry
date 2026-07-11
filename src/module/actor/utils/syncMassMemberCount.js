import { calculateMassMemberCountFromLife } from './calculateMassLifePoints.js';
import { isMassOfEnemies } from './massSettings.js';

const LIFE_PATH = 'system.characteristics.secondaries.lifePoints.value';
const MEMBER_COUNT_PATH = 'system.general.settings.massMemberCount.value';

/**
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 * @param {number} [currentLife]
 */
export function resolveMassMemberCountForActor(actor, currentLife) {
  if (!isMassOfEnemies(actor)) return null;

  const settings = actor?.system?.general?.settings;
  const individualLife = Number(settings?.individualLife?.value) || 0;
  const life =
    currentLife ??
    Number(actor?.system?.characteristics?.secondaries?.lifePoints?.value) ??
    0;

  return calculateMassMemberCountFromLife({
    individualLife,
    currentLife: life,
    damageAccumulation: !!settings?.damageAccumulation?.value
  });
}

/**
 * @param {import('../ABFActor').ABFActor | Actor | { system?: object } | null | undefined} actor
 * @param {number} currentLife
 */
export function buildMassMemberCountUpdate(actor, currentLife) {
  const memberCount = resolveMassMemberCountForActor(actor, currentLife);
  if (memberCount == null) return null;

  return { [MEMBER_COUNT_PATH]: memberCount };
}

/**
 * Keeps mass member count aligned with the actor's current life in-memory.
 * @param {import('../ABFActor').ABFActor | Actor} actor
 */
export function syncMassMemberCountOnActor(actor, { persist = false } = {}) {
  const memberCount = resolveMassMemberCountForActor(actor);
  if (memberCount == null) return;

  const settings = actor.system?.general?.settings;
  if (!settings?.massMemberCount) return;

  const current = Number(settings.massMemberCount.value) || 0;
  if (current === memberCount) return;

  settings.massMemberCount.value = memberCount;
  if (persist && typeof actor.updateSource === 'function') {
    actor.updateSource({ [MEMBER_COUNT_PATH]: memberCount });
  }
}

/**
 * @param {object} actorChanges
 * @param {import('../ABFActor').ABFActor | Actor} actor
 */
export function augmentActorChangesWithMassMemberCount(actorChanges, actor) {
  if (!isMassOfEnemies(actor)) return actorChanges;
  if (!(LIFE_PATH in actorChanges)) return actorChanges;

  const update = buildMassMemberCountUpdate(actor, Number(actorChanges[LIFE_PATH]) || 0);
  return update ? { ...actorChanges, ...update } : actorChanges;
}

export { LIFE_PATH, MEMBER_COUNT_PATH };
