import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getEquippedArmors } from '../../../../utils/getEquippedArmors';

export const calculateWearArmorNaturalPenalty = (data: ABFActorDataSourceData): number => {
  const totalWearRequirement = getEquippedArmors(data).reduce(
    (prev, curr) => prev + curr.data.wearArmorRequirement.final.value,
    0
  );

  return data.combat.wearArmor.value - totalWearRequirement;
};
