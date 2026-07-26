/** @typedef {import('./Migration').Migration} Migration */

const FATIGUE_MODIFIER_KEY = 'system.automationOptions.calculateFatigueModifier.value';

/**
 * Convert legacy boolean fatigue-modifier flag to a numeric multiplier.
 * @param {unknown} value
 * @returns {number | null} New multiplier, or null if already numeric / unknown.
 */
function booleanToMultiplier(value) {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value === 'true' || value === 'True') return 1;
  if (value === 'false' || value === 'False') return 0;
  return null;
}

/**
 * @param {object[]} changes
 * @returns {boolean} Whether any change was updated.
 */
function migrateEffectChanges(changes) {
  if (!Array.isArray(changes)) return false;

  let changed = false;
  for (const change of changes) {
    if (change?.key !== FATIGUE_MODIFIER_KEY) continue;
    const next = booleanToMultiplier(change.value);
    if (next === null) continue;
    change.value = String(next);
    changed = true;
  }
  return changed;
}

/**
 * @param {object[]} changes
 * @returns {boolean}
 */
function effectChangesNeedMigration(changes) {
  if (!Array.isArray(changes)) return false;
  return changes.some(
    c => c?.key === FATIGUE_MODIFIER_KEY && booleanToMultiplier(c.value) !== null
  );
}

/**
 * @param {import('../../actor/ABFActor').ABFActor | import('../../items/ABFItem').default} doc
 * @returns {boolean}
 */
function documentEffectsNeedMigration(doc) {
  const effects = doc.effects;
  if (!effects) return false;

  const list = Array.isArray(effects)
    ? effects
    : effects.contents ??
      (typeof effects.values === 'function' ? [...effects.values()] : []);

  return list.some(effect => effectChangesNeedMigration(effect.changes));
}

/** @type Migration */
export const Migration23AutomationModifierMultipliers = {
  id: 'migration_automation-modifier-multipliers',
  version: '2.2.4',
  order: 10,
  title: 'Automation options: fatigue and negative LP multipliers',
  description:
    'Updates automation settings:<br>' +
    '1. calculateFatigueModifier boolean becomes a numeric multiplier (true → 1, false → 0).<br>' +
    '2. Adds negativeLifePointsModifier with default 1.<br>' +
    '3. Active effects that overrode the fatigue flag as boolean are converted to 0/1.',

  filterActors(actor) {
    const options = actor.system?.automationOptions;
    if (!options) return true;

    const fatigue = options.calculateFatigueModifier?.value;
    if (booleanToMultiplier(fatigue) !== null) return true;
    if (options.negativeLifePointsModifier?.value === undefined) return true;

    if (documentEffectsNeedMigration(actor)) return true;

    return actor.items.some(
      item =>
        effectChangesNeedMigration(item.system?.effectData?.changes) ||
        documentEffectsNeedMigration(item)
    );
  },

  filterItems(item) {
    return (
      effectChangesNeedMigration(item.system?.effectData?.changes) ||
      documentEffectsNeedMigration(item)
    );
  },

  async updateActor(actor) {
    if (!actor.system.automationOptions) {
      actor.system.automationOptions = {};
    }
    const options = actor.system.automationOptions;

    const fatigueNext = booleanToMultiplier(options.calculateFatigueModifier?.value);
    if (fatigueNext !== null) {
      options.calculateFatigueModifier = { value: fatigueNext };
    } else if (!options.calculateFatigueModifier) {
      options.calculateFatigueModifier = { value: 1 };
    }

    if (options.negativeLifePointsModifier?.value === undefined) {
      options.negativeLifePointsModifier = { value: 1 };
    }

    // Active Effects are separate documents; persist their changes inline.
    for (const effect of actor.effects ?? []) {
      if (!effectChangesNeedMigration(effect.changes)) continue;
      const changes = foundry.utils.deepClone(effect.changes);
      migrateEffectChanges(changes);
      await effect.update({ changes }, { render: false });
    }

    return actor;
  },

  async updateItem(item) {
    if (item.system?.effectData?.changes) {
      migrateEffectChanges(item.system.effectData.changes);
    }

    for (const effect of item.effects ?? []) {
      if (!effectChangesNeedMigration(effect.changes)) continue;
      const changes = foundry.utils.deepClone(effect.changes);
      migrateEffectChanges(changes);
      await effect.update({ changes }, { render: false });
    }

    return item;
  }
};
