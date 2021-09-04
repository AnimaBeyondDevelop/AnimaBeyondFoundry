import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { calculateArmorsNaturalPenaltyWithoutEquippedArmorsPenalty } from './calculations/calculateArmorsNaturalPenaltyWithoutEquippedArmorsPenalty';
import { calculateWearArmorNaturalPenalty } from './calculations/calculateWearArmorNaturalPenalty';
import { calculateEquippedArmorsPenalty } from './calculations/calculateEquippedArmorsPenalty';

export const calculateNaturalPenalty = (data: ABFActorDataSourceData) => {
  const wearArmorNaturalPenalty = calculateWearArmorNaturalPenalty(data);
  let armorsNaturalPenalty = calculateArmorsNaturalPenaltyWithoutEquippedArmorsPenalty(data);

  if (wearArmorNaturalPenalty > 0) {
    armorsNaturalPenalty += wearArmorNaturalPenalty;
  }

  const equippedArmorsPenalty = calculateEquippedArmorsPenalty(data);

  data.general.modifiers.naturalPenalty.byArmors.value = Math.min(0, armorsNaturalPenalty) + equippedArmorsPenalty;
  data.general.modifiers.naturalPenalty.byWearArmorRequirement.value = Math.min(0, wearArmorNaturalPenalty);
};
