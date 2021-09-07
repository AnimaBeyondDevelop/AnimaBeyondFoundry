import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { calculateNonHelmetArmorsNaturalPenalty } from './calculations/calculateNonHelmetArmorsNaturalPenalty';
import { calculateWearArmorNaturalPenalty } from './calculations/calculateWearArmorNaturalPenalty';
import { calculateEquippedArmorsPenalty } from './calculations/calculateEquippedArmorsPenalty';

export const mutateNaturalPenalty = (data: ABFActorDataSourceData) => {
  const wearArmorNaturalPenalty = calculateWearArmorNaturalPenalty(data);
  let armorsNaturalPenalty = calculateNonHelmetArmorsNaturalPenalty(data);

  if (wearArmorNaturalPenalty > 0) {
    armorsNaturalPenalty += wearArmorNaturalPenalty;
  }

  const equippedArmorsPenalty = calculateEquippedArmorsPenalty(data);

  data.general.modifiers.naturalPenalty.byArmors.value = Math.min(0, armorsNaturalPenalty) + equippedArmorsPenalty;
  data.general.modifiers.naturalPenalty.byWearArmorRequirement.value = Math.min(0, wearArmorNaturalPenalty);
};
