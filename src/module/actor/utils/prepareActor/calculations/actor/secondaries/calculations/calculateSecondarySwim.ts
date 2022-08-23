import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { calculateNaturalPenaltyWithoutWearArmor } from '../../natural-penalty/calculations/calculateWearArmorNaturalPenalty';

export const calculateSecondarySwim = (data: ABFActorDataSourceData): number => {
  const naturalPenalty = -calculateNaturalPenaltyWithoutWearArmor(data);

  return (
    data.secondaries.athletics.swim.base.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.value +
    naturalPenalty +
    data.general.modifiers.naturalPenalty.byWearArmorRequirement.value
  );
};
