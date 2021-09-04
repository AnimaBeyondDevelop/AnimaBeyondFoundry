import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { DerivedField } from '../../../../../../types/Items';
import { calculateWearArmorNaturalPenalty } from '../natural-penalty/calculations/calculateWearArmorNaturalPenalty';
import { calculateArmorsNaturalPenaltyWithoutEquippedArmorsPenalty } from '../natural-penalty/calculations/calculateArmorsNaturalPenaltyWithoutEquippedArmorsPenalty';
import { calculateEquippedArmorsPenalty } from '../natural-penalty/calculations/calculateEquippedArmorsPenalty';

const SECONDARIES_AFFECTED_BY_ALL_PHYSIC_PENALTIES = ['acrobatics', 'athleticism', 'swim', 'climb', 'jump'];
const SECONDARIES_AFFECTED_BY_ARMOR_PHYSIC_PENALTY = ['featsOfStrength', 'dance'];
const SECONDARIES_AFFECTED_BY_WEAR_ARMOR_PHYSIC_PENALTY = ['ride', 'piloting'];

export const calculateSecondariesData = (data: ABFActorDataSourceData) => {
  const { secondaries } = data;

  for (const rawSecondaryKey of Object.keys(secondaries)) {
    const secondaryKey = rawSecondaryKey as keyof ABFActorDataSourceData['secondaries'];

    for (const key of Object.keys(secondaries[secondaryKey])) {
      const secondary = data.secondaries[secondaryKey][key] as DerivedField;

      secondary.final.value = secondary.base.value + data.general.modifiers.allActions.final.value;

      const naturalPenaltyWithoutEquippedArmorsPenalty =
        calculateArmorsNaturalPenaltyWithoutEquippedArmorsPenalty(data);

      if (key === 'hide') {
        secondary.final.value += data.general.modifiers.naturalPenalty.byArmors.value;
      }

      const wearArmorNaturalPenalty = calculateWearArmorNaturalPenalty(data);

      if (key === 'swim') {
        if (wearArmorNaturalPenalty > 0) {
          secondary.final.value -= wearArmorNaturalPenalty;
        }
      } else if (key === 'stealth') {
        const equippedArmorsPenalty = calculateEquippedArmorsPenalty(data);

        secondary.final.value +=
          Math.min(
            wearArmorNaturalPenalty + naturalPenaltyWithoutEquippedArmorsPenalty,
            naturalPenaltyWithoutEquippedArmorsPenalty / 2
          ) + equippedArmorsPenalty;
      }

      if (SECONDARIES_AFFECTED_BY_ALL_PHYSIC_PENALTIES.includes(key)) {
        secondary.final.value +=
          data.general.modifiers.physicalActions.value +
          data.general.modifiers.naturalPenalty.byArmors.value +
          data.general.modifiers.naturalPenalty.byWearArmorRequirement.value;
      }

      if (SECONDARIES_AFFECTED_BY_ARMOR_PHYSIC_PENALTY.includes(key)) {
        secondary.final.value +=
          data.general.modifiers.physicalActions.value + data.general.modifiers.naturalPenalty.byArmors.value;
      }

      if (SECONDARIES_AFFECTED_BY_WEAR_ARMOR_PHYSIC_PENALTY.includes(key)) {
        secondary.final.value +=
          data.general.modifiers.physicalActions.value +
          data.general.modifiers.naturalPenalty.byWearArmorRequirement.value;
      }
    }
  }
};
