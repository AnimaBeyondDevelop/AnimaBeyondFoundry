import { ArmorDataSource } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateArmorNaturalPenalty = (armor: ArmorDataSource) =>
  Math.min(armor.system.naturalPenalty.base.value + armor.system.quality.value, 0);
