/**
 * @param {import("../../../../../../../types/Items").ArmorDataSource} armor
 * @returns {number}
 */
export const calculateArmorIntegrity = armor => {
  return Math.max(armor.system.integrity.base.value + armor.system.quality.value, 0);
};
