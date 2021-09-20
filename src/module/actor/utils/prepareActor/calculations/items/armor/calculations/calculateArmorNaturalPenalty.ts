import { ArmorDataSource } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateArmorNaturalPenalty = (armor: ArmorDataSource) =>
  Math.min(armor.data.naturalPenalty.base.value + armor.data.quality.value, 0);
