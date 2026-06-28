import { System } from '../systemMeta.js';

/**
 * Creates or reuses a per-item macro and assigns it to a hotbar slot.
 *
 * @param {object} params
 * @param {string} params.id - Macro executor id (also stored in flags.kind).
 * @param {Actor} params.actor
 * @param {Item} params.item
 * @param {number} params.slot
 * @param {string} params.name - Macro display name.
 * @param {Record<string, unknown>} [params.payloadExtras] - Extra fields passed to the executor.
 * @returns {Promise<boolean>}
 */
export async function createItemMacro({ id, actor, item, slot, name, payloadExtras = {} }) {
  const actorUuid = actor.uuid;
  const itemUuid = item.uuid;
  const payload = { id, actorUuid, itemUuid, ...payloadExtras };
  const command = `await game.animabf.macros.execute(${JSON.stringify(payload)});`;

  let macro = game.macros?.find(
    m =>
      m.getFlag(System.id, 'kind') === id &&
      m.getFlag(System.id, 'actorUuid') === actorUuid &&
      m.getFlag(System.id, 'itemUuid') === itemUuid
  );

  if (!macro) {
    macro = await Macro.create(
      {
        name,
        type: 'script',
        img: item.img,
        command,
        flags: {
          [System.id]: { kind: id, actorUuid, itemUuid }
        }
      },
      { displaySheet: false }
    );
  }

  await game.user?.assignHotbarMacro(macro, slot);
  return true;
}
