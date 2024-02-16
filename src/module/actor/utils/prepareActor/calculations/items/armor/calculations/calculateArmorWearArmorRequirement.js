/**
 * @param {import("../../../../../../../types/Items").ArmorDataSource} armor
 * @returns {number}
 */
export const calculateArmorWearArmorRequirement = armor =>
  Math.max(armor.system.wearArmorRequirement.base.value - armor.system.quality.value, 0);
