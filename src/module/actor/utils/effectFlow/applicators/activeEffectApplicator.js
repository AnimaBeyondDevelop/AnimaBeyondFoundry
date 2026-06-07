// /module/actor/utils/effectFow/applicators/activeEffectApplicator.js

/**
 * Normalize a change's mode to one of the four operations we know how to
 * apply: 'add' | 'multiply' | 'override' | 'custom'.
 *
 * Active Effect changes can arrive in two shapes:
 *  - Legacy custom shape: `change.type` is a string ("add", "multiply",
 *    "override"). This is what items effect persist in
 *    `system.effectData.changes` and what the in-system flow has historically
 *    produced.
 *  - Foundry-standard shape: `change.mode` is a numeric constant per
 *    CONST.ACTIVE_EFFECT_MODES. Any AE that goes through Foundry's schema
 *    validation (e.g. created via the native UI, or after a save/load cycle)
 *    arrives in this shape.
 *
 * Accepting both keeps existing data working while also supporting AEs that
 * use the standard API.
 *
 * @param {{type?: string, mode?: number}} change
 * @returns {'add'|'multiply'|'override'|'custom'}
 */
function resolveChangeMode(change) {
  if (typeof change?.type === 'string') return change.type;
  switch (change?.mode) {
    case 1: return 'multiply'; // CONST.ACTIVE_EFFECT_MODES.MULTIPLY
    case 2: return 'add';      // CONST.ACTIVE_EFFECT_MODES.ADD
    case 3: return 'override'; // CONST.ACTIVE_EFFECT_MODES.DOWNGRADE -> treated as override
    case 4: return 'override'; // CONST.ACTIVE_EFFECT_MODES.UPGRADE   -> treated as override
    case 5: return 'override'; // CONST.ACTIVE_EFFECT_MODES.OVERRIDE
    default: return 'add';     // CUSTOM (0) or undefined: default to add
  }
}

export function applySingleActiveEffectChange(actor, effect, change) {
  const key = change.key;
  const mode = resolveChangeMode(change);

  const rawValue =
    typeof actor._applyDynamicEffectValue === 'function'
      ? actor._applyDynamicEffectValue(change.value)
      : change.value;

  const beforeSystem = foundry.utils.getProperty(actor, key);

  const numericCurrent = Number(beforeSystem);
  const numericValue = Number(rawValue);

  let nextValue = rawValue;

  switch (mode) {
    case 'add':
      nextValue =
        !Number.isNaN(numericCurrent) && !Number.isNaN(numericValue)
          ? numericCurrent + numericValue
          : `${beforeSystem ?? ''}${rawValue ?? ''}`;
      break;

    case 'multiply':
      nextValue =
        !Number.isNaN(numericCurrent) && !Number.isNaN(numericValue)
          ? numericCurrent * numericValue
          : beforeSystem;
      break;

    case 'override':
      // If the AE value is a numeric string ("99"), coerce to number so the
      // resulting field stays numeric and downstream calculations don't break
      // on string concatenation.
      nextValue = !Number.isNaN(numericValue) ? numericValue : rawValue;
      break;

    default:
      nextValue = rawValue;
      break;
  }

  foundry.utils.setProperty(actor, key, nextValue);
}
