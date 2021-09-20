import { ArmorDataSource } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateArmorIntegrity = (armor: ArmorDataSource) => {
  return Math.max(armor.data.integrity.base.value + armor.data.quality.value, 0);
};
