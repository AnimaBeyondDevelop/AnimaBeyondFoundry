import { ArmorLocation } from '@module/data/items/enums/ArmorEnums';

/**
 * @param {import("../../../../../../../types/Items").ArmorDataSource} armor
 * @returns {number}
 */
export const calculateArmorNaturalPenalty = armor => {
  if (armor.system.localization == ArmorLocation.HEAD) return 0;
  return Math.min(armor.system.naturalPenalty.base.value + armor.system.quality.value, 0);
};
