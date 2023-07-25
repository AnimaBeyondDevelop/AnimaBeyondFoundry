import { ArmorDataSource } from '../../../../../../../types/Items';

export const calculateArmorWearArmorRequirement = (armor: ArmorDataSource) =>
  Math.max(armor.system.wearArmorRequirement.base.value - armor.system.quality.value, 0);
