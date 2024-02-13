/**
 * @param {import("../../../../../../../types/Items").ArmorDataSource} armor
 * @returns {number}
 */
export const calculateArmorMovementRestriction = armor =>
  Math.min(
    armor.system.movementRestriction.base.value +
      Math.floor(armor.system.quality.value / 5),
    0
  );
