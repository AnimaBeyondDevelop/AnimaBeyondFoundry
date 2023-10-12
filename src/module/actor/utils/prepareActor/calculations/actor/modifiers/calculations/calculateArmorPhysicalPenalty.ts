import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getEquippedArmors } from '../../../../utils/getEquippedArmors';

export const calculateEquippedArmorsRequirement = (data: ABFActorDataSourceData): number => {
  return getEquippedArmors(data).reduce((prev, curr) => prev + curr.system.wearArmorRequirement.final.value, 0);
};

export const calculateArmorPhysicalPenalty = (data: ABFActorDataSourceData): number => {
  const totalWearRequirement = calculateEquippedArmorsRequirement(data);

  return Math.min(0,data.combat.wearArmor.value - totalWearRequirement);
};
