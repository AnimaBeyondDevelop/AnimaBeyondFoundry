// /module/actor/utils/effectFow/applicators/activeEffectApplicator.js

export function applySingleActiveEffectChange(actor, effect, change) {
  const key = change.key;
  const mode = change.type;

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
      nextValue = rawValue;
      break;

    default:
      nextValue = rawValue;
      break;
  }

  foundry.utils.setProperty(actor, key, nextValue);
}
