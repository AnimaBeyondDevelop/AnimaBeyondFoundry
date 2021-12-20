import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { calculateEquippedArmorsPenalty } from '../../natural-penalty/calculations/calculateEquippedArmorsPenalty';
import { calculateNonHelmetArmorsNaturalPenalty } from '../../natural-penalty/calculations/calculateNonHelmetArmorsNaturalPenalty';
import { calculateWearArmorNaturalPenalty } from '../../natural-penalty/calculations/calculateWearArmorNaturalPenalty';

export const calculateSecondaryStealth = (data: ABFActorDataSourceData): number => {
  const equippedArmorsPenalty = calculateEquippedArmorsPenalty(data);

  const wearArmorNaturalPenalty = calculateWearArmorNaturalPenalty(data);

  const naturalPenaltyWithoutEquippedArmorsPenalty = calculateNonHelmetArmorsNaturalPenalty(data);

  const armorPenalty =
    Math.min(
      wearArmorNaturalPenalty + naturalPenaltyWithoutEquippedArmorsPenalty,
      naturalPenaltyWithoutEquippedArmorsPenalty / 2
    ) + equippedArmorsPenalty;

  return data.secondaries.subterfuge.stealth.base.value + data.general.modifiers.allActions.final.value + armorPenalty;
};
