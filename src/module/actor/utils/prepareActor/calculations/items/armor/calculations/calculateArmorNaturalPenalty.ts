import { ArmorDataSource } from '../../../../../../../types/Items';
import { ArmorLocation } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateArmorNaturalPenalty = (armor: ArmorDataSource) =>{
  if(armor.system.localization == ArmorLocation.HEAD) return 0;
  return Math.min(armor.system.naturalPenalty.base.value + armor.system.quality.value, 0);
};
