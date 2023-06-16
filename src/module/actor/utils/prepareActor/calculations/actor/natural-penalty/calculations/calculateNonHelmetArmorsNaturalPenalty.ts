import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { ArmorDataSource, ArmorLocation } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateNonHelmetArmorsNaturalPenalty = (data: ABFActorDataSourceData): number => {
  const combat = data.combat as { armors: ArmorDataSource[] };

  const equippedArmors = combat.armors.filter(
    armor => armor.system.equipped.value && armor.system.localization.value !== ArmorLocation.HEAD
  );

  return equippedArmors.reduce((prev, curr) => prev + curr.system.naturalPenalty.final.value, 0);
};
