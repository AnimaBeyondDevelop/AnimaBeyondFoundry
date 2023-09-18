import { ArmorDataSource } from '../../../../../../../types/Items';

export const calculateArmorIntegrity = (armor: ArmorDataSource) => {
  return Math.max(armor.system.integrity.base.value + armor.system.quality.value, 0);
};
