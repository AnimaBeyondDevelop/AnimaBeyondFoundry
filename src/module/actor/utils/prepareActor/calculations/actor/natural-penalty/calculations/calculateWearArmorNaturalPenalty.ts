import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { ArmorDataSource } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateWearArmorNaturalPenalty = (data: ABFActorDataSourceData): number => {
  const combat = data.combat as { armors: ArmorDataSource[] };

  const equippedArmors = combat.armors.filter(armor => armor.data.equipped?.value);

  const totalWearRequirement = equippedArmors.reduce(
    (prev, curr) => prev + curr.data.wearArmorRequirement.final.value,
    0
  );

  return data.combat.wearArmor.value - totalWearRequirement;
};
