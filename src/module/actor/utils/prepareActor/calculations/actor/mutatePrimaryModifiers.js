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

mutatePrimaryModifiers.abfFlow = {
  deps: [
    'system.characteristics.primaries.strength.value',
    'system.characteristics.primaries.dexterity.value',
    'system.characteristics.primaries.agility.value',
    'system.characteristics.primaries.constitution.value',
    'system.characteristics.primaries.intelligence.value',
    'system.characteristics.primaries.power.value',
    'system.characteristics.primaries.willPower.value',
    'system.characteristics.primaries.perception.value'
  ],
  mods: [
    'system.characteristics.primaries.strength.mod',
    'system.characteristics.primaries.dexterity.mod',
    'system.characteristics.primaries.agility.mod',
    'system.characteristics.primaries.constitution.mod',
    'system.characteristics.primaries.intelligence.mod',
    'system.characteristics.primaries.power.mod',
    'system.characteristics.primaries.willPower.mod',
    'system.characteristics.primaries.perception.mod'
  ]
};
