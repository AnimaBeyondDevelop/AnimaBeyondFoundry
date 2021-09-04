import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { ArmorDataSource } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateArmorsNaturalPenaltyWithoutEquippedArmorsPenalty = (data: ABFActorDataSourceData): number => {
  const combat = data.combat as { armors: ArmorDataSource[] };

  const equippedArmors = combat.armors.filter(armor => armor.data.equipped?.value);

  return equippedArmors.reduce((prev, curr) => prev + curr.data.naturalPenalty.final.value, 0);
};
