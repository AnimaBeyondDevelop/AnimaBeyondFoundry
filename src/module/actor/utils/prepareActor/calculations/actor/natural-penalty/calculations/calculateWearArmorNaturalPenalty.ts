import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getEquippedArmors } from '../../../../utils/getEquippedArmors';

export const calculateNaturalPenaltyWithoutWearArmor = (data: ABFActorDataSourceData): number => {
  return getEquippedArmors(data).reduce((prev, curr) => prev + curr.data.wearArmorRequirement.final.value, 0);
};

export const calculateWearArmorNaturalPenalty = (data: ABFActorDataSourceData): number => {
  const totalWearRequirement = calculateNaturalPenaltyWithoutWearArmor(data);

  return data.combat.wearArmor.value - totalWearRequirement;
};
