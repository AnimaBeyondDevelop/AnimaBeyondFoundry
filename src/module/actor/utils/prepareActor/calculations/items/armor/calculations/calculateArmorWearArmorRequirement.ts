import { ArmorDataSource } from '../../../../../../../types/combat/ArmorItemConfig';

export const calculateArmorWearArmorRequirement = (armor: ArmorDataSource) =>
  Math.max(armor.data.wearArmorRequirement.base.value - armor.data.quality.value, 0);
