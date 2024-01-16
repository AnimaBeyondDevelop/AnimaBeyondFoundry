import { calculateArmorsNaturalPenalty } from './calculations/calculateArmorsNaturalPenalty';
import { calculateEquippedArmorsNaturalPenalty } from './calculations/calculateEquippedArmorsNaturalPenalty';
import { calculateEquippedArmorsRequirement } from './calculations/calculateArmorPhysicalPenalty';

/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateNaturalPenalty = data => {
  let wearArmor = data.combat.wearArmor.value;
  let wearArmorRequirement = calculateEquippedArmorsRequirement(data);
  let armorsNaturalPenalty = calculateArmorsNaturalPenalty(data);
  let equippedArmorsPenalty = calculateEquippedArmorsNaturalPenalty(data);

  let unreducedNaturalPenalty = Math.min(0, armorsNaturalPenalty) + equippedArmorsPenalty;
  let naturalPenaltyReduction = Math.min(
    -armorsNaturalPenalty,
    Math.max(0, wearArmor - wearArmorRequirement)
  );

  data.general.modifiers.naturalPenalty.unreduced.value = unreducedNaturalPenalty;
  data.general.modifiers.naturalPenalty.reduction.value = naturalPenaltyReduction;
  data.general.modifiers.naturalPenalty.final.value =
    unreducedNaturalPenalty +
    naturalPenaltyReduction +
    data.general.modifiers.naturalPenalty.special.value;
};
