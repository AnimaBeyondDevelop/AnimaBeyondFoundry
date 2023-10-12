import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { ArmorType, ArmorLocation } from '../../../../../../../types/combat/ArmorItemConfig';
import { ArmorDataSource } from '../../../../../../../types/Items';

export const calculateEquippedArmorsNaturalPenalty = (data: ABFActorDataSourceData) => {
  const combat = data.combat as { armors: ArmorDataSource[] };

  const equippedArmorsNonNatural = combat.armors.filter(
    armor => armor.system.equipped.value && armor.system.type.value !== ArmorType.NATURAL && armor.system.localization.value !== ArmorLocation.HEAD
  );

  return Math.min(0, (equippedArmorsNonNatural.length - 1) * -20);
};
