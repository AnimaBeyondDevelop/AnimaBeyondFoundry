import { calculateArmorsNaturalPenalty } from './calculations/calculateArmorsNaturalPenalty';
import { calculateEquippedArmorsNaturalPenalty } from './calculations/calculateEquippedArmorsNaturalPenalty';
import { calculateEquippedArmorsRequirement } from './calculations/calculateArmorPhysicalPenalty';

/**
 * @param {import('../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateNaturalPenalty = data => {
  let wearArmor = data.combat.wearArmor.final.value;
  let wearArmorRequirement = calculateEquippedArmorsRequirement(data);
  let armorsNaturalPenalty = calculateArmorsNaturalPenalty(data);
  let equippedArmorsPenalty = calculateEquippedArmorsNaturalPenalty(data);

  let unreducedNaturalPenalty = Math.min(0, armorsNaturalPenalty);
  let naturalPenaltyReduction = Math.min(
    -armorsNaturalPenalty,
    Math.max(0, wearArmor - wearArmorRequirement)
  );

  data.general.modifiers.naturalPenalty.unreduced.value = unreducedNaturalPenalty;
  data.general.modifiers.naturalPenalty.reduction.value = naturalPenaltyReduction;
  data.general.modifiers.naturalPenalty.final.value =
    unreducedNaturalPenalty +
    naturalPenaltyReduction +
    equippedArmorsPenalty +
    data.general.modifiers.naturalPenalty.base.value +
    data.general.modifiers.naturalPenalty.special.value;
};

mutateNaturalPenalty.abfFlow = {
  deps: [
    'system.combat.wearArmor.final.value',
    'system.combat.armors',
    'system.general.modifiers.naturalPenalty.base.value',
    'system.general.modifiers.naturalPenalty.special.value'
  ],
  mods: [
    'system.general.modifiers.naturalPenalty.unreduced.value',
    'system.general.modifiers.naturalPenalty.reduction.value',
    'system.general.modifiers.naturalPenalty.final.value'
  ]
};
