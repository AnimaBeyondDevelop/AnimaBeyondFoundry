// /module/actor/utils/effectFow/applicators/activeEffectApplicator.js

export function applySingleActiveEffectChange(actor, effect, change) {
  const key = change.key;
  const mode = change.mode;

  const rawValue =
    typeof actor._applyDynamicEffectValue === 'function'
      ? actor._applyDynamicEffectValue(change.value)
      : change.value;

  const beforeSystem = foundry.utils.getProperty(actor, key);

  const numericCurrent = Number(beforeSystem);
  const numericValue = Number(rawValue);

  let nextValue = rawValue;

  switch (mode) {
    case CONST.ACTIVE_EFFECT_MODES.ADD:
      nextValue =
        !Number.isNaN(numericCurrent) && !Number.isNaN(numericValue)
          ? numericCurrent + numericValue
          : `${beforeSystem ?? ''}${rawValue ?? ''}`;
      break;

    case CONST.ACTIVE_EFFECT_MODES.MULTIPLY:
      nextValue =
        !Number.isNaN(numericCurrent) && !Number.isNaN(numericValue)
          ? numericCurrent * numericValue
          : beforeSystem;
      break;

    case CONST.ACTIVE_EFFECT_MODES.OVERRIDE:
      nextValue = rawValue;
      break;

    default:
      nextValue = rawValue;
      break;
  }

  foundry.utils.setProperty(actor, key, nextValue);
}
