import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { ArmorDataSource } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateEquippedArmorsPenalty = (data: ABFActorDataSourceData) => {
  const combat = data.combat as { armors: ArmorDataSource[] };

  const equippedArmors = combat.armors.filter(armor => armor.data.equipped?.value);

  return Math.min(0, (equippedArmors.length - 1) * -20);
};
