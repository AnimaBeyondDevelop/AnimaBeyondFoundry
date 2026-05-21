// /module/actor/utils/findEffectLinkedToItem.js

/**
 * Find the ActiveEffect on `actor` that was created as the runtime mirror of
 * `item` (a system "effect" Item).
 *
 * The natural matching key is `effect.origin === item.uuid`, but on unlinked
 * tokens those two values diverge: the item lives in the TokenDocument delta
 * and carries a UUID prefixed `Scene.<sceneId>.Token.<tokenId>.Actor.<id>.Item.<id>`,
 * while the AE was created with `origin: item.uuid` at a moment where the
 * uuid resolved to the world `Actor.<id>.Item.<id>` form. The trailing
 * `.Item.<id>` segment is stable across both worlds and is what we match on
 * as a fallback. This restores the link in unlinked tokens so toggle and
 * delete actions can find and act on the corresponding AE.
 *
 * @param {object} actor
 * @param {object} item
 * @returns {object|null}
 */
export function findEffectLinkedToItem(actor, item) {
  if (!actor || !item) return null;
  const effects = actor.effects?.contents ?? actor.effects ?? [];
  if (!effects.length) return null;

  const directMatch = effects.find(e => e.origin === item.uuid);
  if (directMatch) return directMatch;

  const itemId = item._id ?? item.id;
  if (!itemId) return null;
  const tailMatch = effects.find(e =>
    typeof e.origin === 'string' && e.origin.endsWith(`.Item.${itemId}`)
  );
  return tailMatch ?? null;
}
