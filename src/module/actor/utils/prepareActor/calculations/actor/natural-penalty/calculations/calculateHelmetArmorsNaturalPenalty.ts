import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { ArmorDataSource, ArmorLocation } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateHelmetArmorsNaturalPenalty = (data: ABFActorDataSourceData): number => {
  const combat = data.combat as { armors: ArmorDataSource[] };

  const equippedArmors = combat.armors.filter(
    armor => armor.data.equipped.value && armor.data.localization.value === ArmorLocation.HEAD
  );

  return equippedArmors.reduce((prev, curr) => prev + curr.data.naturalPenalty.final.value, 0);
};
