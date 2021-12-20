import { ArmorDataSource } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateArmorTA = (armor: ArmorDataSource, ta: number) =>
  Math.max(Math.floor(armor.data.quality.value / 5) + ta, 0);
