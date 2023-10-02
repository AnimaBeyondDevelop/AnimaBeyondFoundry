import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { calculateArmorPhysicalPenalty } from './calculations/calculateArmorPhysicalPenalty';

export const mutatePhysicalModifier = (data: ABFActorDataSourceData) => {
  let armorPhysicalModifier = calculateArmorPhysicalPenalty(data);

  let basePhysicalActionsModifier = armorPhysicalModifier;
  data.general.modifiers.physicalActions.base.value = basePhysicalActionsModifier;
  data.general.modifiers.physicalActions.final.value = basePhysicalActionsModifier + data.general.modifiers.physicalActions.special.value;
};