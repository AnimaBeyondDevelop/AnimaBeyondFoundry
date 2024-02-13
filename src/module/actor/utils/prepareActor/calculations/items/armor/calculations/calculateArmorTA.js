/**
 * @param {import("../../../../../../../types/Items").ArmorDataSource} armor
 * @param {number} ta
 * @returns {number}
 */
export const calculateArmorTA = (armor, ta) =>
  Math.max(Math.floor(armor.system.quality.value / 5) + ta, 0);
