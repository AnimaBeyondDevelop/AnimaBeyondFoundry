import { calculateArmorPhysicalPenalty } from './calculations/calculateArmorPhysicalPenalty';

/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutatePhysicalModifier = data => {
  let armorPhysicalModifier = calculateArmorPhysicalPenalty(data);

  data.general.modifiers.physicalActions.final.value =
    data.general.modifiers.physicalActions.base.value +
    data.general.modifiers.physicalActions.special.value +
    armorPhysicalModifier;
};

mutatePhysicalModifier.abfFlow = {
  deps: [
    'system.general.modifiers.physicalActions.base.value',
    'system.general.modifiers.physicalActions.special.value',

    'system.combat.wearArmor.value',
    'system.combat.armors'
  ],
  mods: ['system.general.modifiers.physicalActions.final.value']
};
