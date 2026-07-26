/** @typedef {import('./Migration').Migration} Migration */

import { ABFItems } from '../../items/ABFItems.js';
import { INITIAL_INVOCATION_DATA } from '../../types/mystic/InvocationItemConfig.js';
import { INITIAL_ENTITY_POWER_DATA } from '../../types/mystic/EntityPowerItemConfig.js';

/**
 * @returns {boolean}
 */
function isItemTypeRegistered(type) {
  const documentTypes = game.system?.documentTypes?.Item;
  if (Array.isArray(documentTypes)) {
    return documentTypes.includes(type);
  }
  return Object.prototype.hasOwnProperty.call(CONFIG.Item?.typeLabels ?? {}, type);
}

/**
 * @param {object} system
 */
function stripNestedPowers(system) {
  const next = foundry.utils.deepClone(system ?? {});
  delete next.powers;
  return next;
}

/**
 * Convert legacy inner invocations + nested powers into real Foundry Items.
 * @param {import('../../actor/ABFActor').ABFActor} actor
 */
async function migrateActor(actor) {
  /** @type {object[]} */
  const toCreate = [];

  // --- Legacy inner invocations (actor.system.mystic.invocations) ---
  const legacyInvocations = foundry.utils.deepClone(
    actor.system?.mystic?.invocations ?? []
  );
  const hasOwnedInvocations = actor.items.some(i => i.type === ABFItems.INVOCATION);

  /** @type {Map<string, string>} oldInnerId -> newFoundryId placeholder keys */
  const pendingPowerLinks = [];

  if (
    !hasOwnedInvocations &&
    Array.isArray(legacyInvocations) &&
    legacyInvocations.some(inv => inv && (inv.name || inv.system))
  ) {
    for (const legacy of legacyInvocations) {
      if (!legacy || typeof legacy !== 'object') continue;
      if (!legacy.name && !legacy.system) continue;

      const tempKey = legacy._id || foundry.utils.randomID();
      const nestedPowers = foundry.utils.deepClone(legacy.system?.powers ?? []);

      toCreate.push({
        name: legacy.name || 'Invocation',
        type: ABFItems.INVOCATION,
        system: {
          ...foundry.utils.deepClone(INITIAL_INVOCATION_DATA),
          ...stripNestedPowers(legacy.system)
        },
        flags: { animabf: { legacyInvocationKey: tempKey } }
      });

      for (const power of nestedPowers) {
        if (!power || typeof power !== 'object') continue;
        pendingPowerLinks.push({
          legacyInvocationKey: tempKey,
          name: power.name || 'Entity Power',
          system: foundry.utils.deepClone(power.system ?? {})
        });
      }
    }
  }

  // --- Nested powers still stored on owned invocation Items ---
  for (const invocation of actor.items.filter(i => i.type === ABFItems.INVOCATION)) {
    const nestedPowers = invocation.system?.powers;
    if (!Array.isArray(nestedPowers) || nestedPowers.length === 0) continue;

    for (const power of nestedPowers) {
      if (!power || typeof power !== 'object') continue;
      toCreate.push({
        name: power.name || 'Entity Power',
        type: ABFItems.ENTITY_POWER,
        system: {
          ...foundry.utils.deepClone(INITIAL_ENTITY_POWER_DATA),
          ...foundry.utils.deepClone(power.system ?? {}),
          invocationId: { value: invocation.id }
        }
      });
    }

    await invocation.update(
      { 'system.powers': [] },
      { render: false }
    );
  }

  if (toCreate.length === 0 && pendingPowerLinks.length === 0) {
    if (Array.isArray(actor.system?.mystic?.invocations) && actor.system.mystic.invocations.length) {
      // Clear stale inner mirrors if owned items already exist.
      if (hasOwnedInvocations) {
        await actor.update({ 'system.mystic.invocations': [] }, { render: false });
      }
    }
    return;
  }

  const created = toCreate.length
    ? await actor.createEmbeddedDocuments('Item', toCreate, { renderSheet: false })
    : [];

  /** @type {object[]} */
  const powerDocs = [];
  for (const link of pendingPowerLinks) {
    const parent = created.find(
      doc => doc.getFlag?.('animabf', 'legacyInvocationKey') === link.legacyInvocationKey
    );
    if (!parent) continue;
    powerDocs.push({
      name: link.name,
      type: ABFItems.ENTITY_POWER,
      system: {
        ...foundry.utils.deepClone(INITIAL_ENTITY_POWER_DATA),
        ...link.system,
        invocationId: { value: parent.id }
      }
    });
  }

  if (powerDocs.length) {
    await actor.createEmbeddedDocuments('Item', powerDocs, { renderSheet: false });
  }

  // Drop legacy keys from newly created invocations.
  for (const doc of created) {
    if (doc.type !== ABFItems.INVOCATION) continue;
    if (doc.getFlag?.('animabf', 'legacyInvocationKey')) {
      await doc.unsetFlag('animabf', 'legacyInvocationKey');
    }
  }

  await actor.update(
    {
      'system.mystic.invocations': [],
      'system.mystic.entityPowers': []
    },
    { render: false }
  );
}

/**
 * @param {import('../../actor/ABFActor').ABFActor} actor
 */
function actorNeedsMigration(actor) {
  const legacy = actor.system?.mystic?.invocations;
  const hasLegacyInner =
    Array.isArray(legacy) &&
    legacy.some(inv => inv && typeof inv === 'object' && (inv.name || inv.system)) &&
    !actor.items.some(i => i.type === ABFItems.INVOCATION);

  const hasNestedPowers = actor.items.some(
    i =>
      i.type === ABFItems.INVOCATION &&
      Array.isArray(i.system?.powers) &&
      i.system.powers.length > 0
  );

  return hasLegacyInner || hasNestedPowers;
}

/** @type Migration */
export const Migration22EntityPowerItems = {
  id: 'migration_entity-power-items-v1',
  version: '2.2.3',
  order: 9,
  title: 'Convert entity powers to Foundry Items',
  description:
    'Extracts invocation entity powers into real Item documents linked to their deity, ' +
    'so they can be dragged to the Items tab and stored in compendiums. Also converts any ' +
    'remaining inner invocations.',

  /**
   * Run in migrate() so failures are not swallowed per-actor and the migration
   * is not marked applied when Item types are missing.
   */
  async migrate() {
    if (
      !isItemTypeRegistered(ABFItems.INVOCATION) ||
      !isItemTypeRegistered(ABFItems.ENTITY_POWER)
    ) {
      throw new Error(
        'Item types "invocation" / "entityPower" are not registered. ' +
          'Rebuild the system (npm run build:dev), refresh Foundry (F5), then retry.'
      );
    }

    for (const actor of game.actors) {
      if (!actorNeedsMigration(actor)) continue;
      await migrateActor(actor);
    }

    for (const scene of game.scenes) {
      for (const token of scene.tokens) {
        if (token.actorLink || !token.actor) continue;
        if (!actorNeedsMigration(token.actor)) continue;
        await migrateActor(token.actor);
      }
    }
  }
};
