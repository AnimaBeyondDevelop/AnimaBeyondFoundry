import { ArmorDataSource } from '../../../../../../../types/Items';

export const calculateArmorTA = (armor: ArmorDataSource, ta: number) =>
  Math.max(Math.floor(armor.system.quality.value / 5) + ta, 0);
