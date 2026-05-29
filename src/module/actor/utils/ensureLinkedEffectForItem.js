// /module/actor/utils/ensureLinkedEffectForItem.js
import { findEffectLinkedToItem } from './findEffectLinkedToItem.js';

/**
 * Ensure the actor has an ActiveEffect document linked to the given system
 * "effect" Item. If one already exists (matched via findEffectLinkedToItem)
 * it is returned unchanged; otherwise a fresh AE is created from the item's
 * `system.effectData` payload.
 *
 * Extracted from ABFActorSheet#_ensureEffectForItem so the same logic can be
 * triggered from any flow that creates an effect Item on an actor (drop to
 * a token, macro, programmatic creation), not just from a sheet drop.
 *
 * @param {object} actor  Foundry Actor (or token actor).
 * @param {object} item   Foundry Item of type 'effect'.
 * @returns {Promise<object|null>} The linked AE, or null on failure.
 */
export async function ensureLinkedEffectForItem(actor, item) {
  if (!actor || !item) return null;

  const existing = findEffectLinkedToItem(actor, item);
  if (existing) return existing;

  const rawBaseData = item.system?.effectData ?? {};
  // Drop any stale origin baked into stored data; the new AE must point at
  // the current item's uuid.
  const { origin, ...baseData } = rawBaseData;

  const data = foundry.utils.mergeObject(
    {
      name: item.name,
      icon: item.img || 'icons/svg/aura.svg',
      disabled: !item.system?.active,
      origin: item.uuid
    },
    baseData,
    { inplace: false }
  );

  const [created] = await actor.createEmbeddedDocuments('ActiveEffect', [data]);
  return created ?? null;
}
