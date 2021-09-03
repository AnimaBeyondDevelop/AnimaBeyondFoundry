import { ABFActorDataSourceData } from '../../../../../types/Actor';
import { ArmorDataSource } from '../../../../../types/combat/ArmorItemConfig';

export const calculateNaturalPenalty = (data: ABFActorDataSourceData) => {
  const combat = data.combat as { armors: ArmorDataSource[] };

  const equippedArmors = combat.armors.filter(armor => armor.data.equipped?.value);

  const equippedArmorsPenalty = Math.min(0, (equippedArmors.length - 1) * -20);

  const totalWearRequirement = equippedArmors.reduce(
    (prev, curr) => prev + curr.data.wearArmorRequirement.final.value,
    0
  );

  const totalNaturalPenalty = equippedArmors.reduce((prev, curr) => prev + curr.data.naturalPenalty.final.value, 0);

  const naturalPenalty = data.combat.wearArmor.value + totalNaturalPenalty - totalWearRequirement;

  data.general.modifiers.naturalPenalty.value = Math.min(0, naturalPenalty) + equippedArmorsPenalty;
};
