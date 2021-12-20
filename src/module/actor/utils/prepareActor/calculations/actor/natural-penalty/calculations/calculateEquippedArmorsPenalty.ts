import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { ArmorDataSource, ArmorType } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateEquippedArmorsPenalty = (data: ABFActorDataSourceData) => {
  const combat = data.combat as { armors: ArmorDataSource[] };

  const equippedArmorsNonNatural = combat.armors.filter(
    armor => armor.data.equipped.value && armor.data.type.value !== ArmorType.NATURAL
  );

  return Math.min(0, (equippedArmorsNonNatural.length - 1) * -20);
};
