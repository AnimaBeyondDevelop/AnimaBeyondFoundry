import { calculateArmorPhysicalPenalty } from './calculations/calculateArmorPhysicalPenalty';

/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutatePhysicalModifier = data => {
  let armorPhysicalModifier = calculateArmorPhysicalPenalty(data);

  data.general.modifiers.physicalActions.final.value =
    data.general.modifiers.physicalActions.base.value + data.general.modifiers.physicalActions.special.value + armorPhysicalModifier;
};

