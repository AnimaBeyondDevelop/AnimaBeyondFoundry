import { calculateArmorsNaturalPenalty } from './calculations/calculateArmorsNaturalPenalty';
import { calculateEquippedArmorsNaturalPenalty } from './calculations/calculateEquippedArmorsNaturalPenalty';
import { calculateEquippedArmorsRequirement } from './calculations/calculateArmorPhysicalPenalty';

// ── Individual natural penalty mutators ──────────────────────────────────────

export const mutateNaturalPenaltyUnreduced = data => {
  let armorsNaturalPenalty = calculateArmorsNaturalPenalty(data);
  data.general.modifiers.naturalPenalty.unreduced.value = Math.min(0, armorsNaturalPenalty);
};

mutateNaturalPenaltyUnreduced.abfFlow = {
  deps: [
    'system.combat.wearArmor.final.value',
    'system.combat.armors'
  ],
  mods: ['system.general.modifiers.naturalPenalty.unreduced.value']
};

export const mutateNaturalPenaltyReduction = data => {
  let wearArmor = data.combat.wearArmor.final.value;
  let wearArmorRequirement = calculateEquippedArmorsRequirement(data);
  let armorsNaturalPenalty = calculateArmorsNaturalPenalty(data);

  data.general.modifiers.naturalPenalty.reduction.value = Math.min(
    -armorsNaturalPenalty,
    Math.max(0, wearArmor - wearArmorRequirement)
  );
};

mutateNaturalPenaltyReduction.abfFlow = {
  deps: [
    'system.combat.wearArmor.final.value',
    'system.combat.armors'
  ],
  mods: ['system.general.modifiers.naturalPenalty.reduction.value']
};

export const mutateNaturalPenaltyFinal = data => {
  let equippedArmorsPenalty = calculateEquippedArmorsNaturalPenalty(data);

  data.general.modifiers.naturalPenalty.final.value =
    data.general.modifiers.naturalPenalty.unreduced.value +
    data.general.modifiers.naturalPenalty.reduction.value +
    equippedArmorsPenalty +
    data.general.modifiers.naturalPenalty.base.value +
    data.general.modifiers.naturalPenalty.special.value;
};

mutateNaturalPenaltyFinal.abfFlow = {
  deps: [
    'system.general.modifiers.naturalPenalty.unreduced.value',
    'system.general.modifiers.naturalPenalty.reduction.value',
    'system.general.modifiers.naturalPenalty.base.value',
    'system.general.modifiers.naturalPenalty.special.value',
    'system.combat.armors'
  ],
  mods: ['system.general.modifiers.naturalPenalty.final.value']
};

/**
 * @deprecated Use mutateNaturalPenaltyUnreduced, mutateNaturalPenaltyReduction
 *   and mutateNaturalPenaltyFinal instead.
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
