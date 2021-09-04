import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { calculateWearArmorNaturalPenalty } from '../../natural-penalty/calculations/calculateWearArmorNaturalPenalty';

export const calculateSecondarySwim = (data: ABFActorDataSourceData): number => {
  const wearArmorNaturalPenalty = calculateWearArmorNaturalPenalty(data);

  const swim =
    data.secondaries.athletics.swim.base.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.value +
    data.general.modifiers.naturalPenalty.byArmors.value +
    data.general.modifiers.naturalPenalty.byWearArmorRequirement.value;

  if (wearArmorNaturalPenalty > 0) {
    return swim - wearArmorNaturalPenalty;
  }

  return swim;
};
