import { calculateAttributeModifier } from '../util/calculateAttributeModifier';

/**
 * Adds to primary characteristics object without modifiers its modifiers,
 * calculated based on its value
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutatePrimaryModifiers = data => {
  const { primaries } = data.characteristics;

  for (const primaryKey of Object.keys(primaries)) {
    primaries[primaryKey] = {
      value: primaries[primaryKey].value,
      mod: calculateAttributeModifier(primaries[primaryKey].value)
    };
  }
};
