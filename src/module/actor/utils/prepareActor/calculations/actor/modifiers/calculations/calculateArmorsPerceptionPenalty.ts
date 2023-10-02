import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { ArmorLocation } from '../../../../../../../types/combat/ArmorItemConfig';
import { ArmorDataSource } from '../../../../../../../types/Items';

export const calculateArmorsPerceptionPenalty = (
  data: ABFActorDataSourceData
): number => {
  const combat = data.combat as { armors: ArmorDataSource[] };

  const equippedArmors = combat.armors.filter(
    armor =>
      armor.system.equipped.value &&
      armor.system.localization.value === ArmorLocation.HEAD
  );

  return equippedArmors.reduce(
    (prev, curr) => prev + curr.system.perceptionPenalty.final.value,
    0
  );
};
