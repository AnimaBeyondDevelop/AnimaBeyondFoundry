import { calculateArmorPhysicalPenalty } from './calculations/calculateArmorPhysicalPenalty';

/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutatePhysicalModifier = data => {
  let armorPhysicalModifier = calculateArmorPhysicalPenalty(data);

  let basePhysicalActionsModifier = armorPhysicalModifier;
  data.general.modifiers.physicalActions.base.value = basePhysicalActionsModifier;
  data.general.modifiers.physicalActions.final.value =
    basePhysicalActionsModifier + data.general.modifiers.physicalActions.special.value;
};

