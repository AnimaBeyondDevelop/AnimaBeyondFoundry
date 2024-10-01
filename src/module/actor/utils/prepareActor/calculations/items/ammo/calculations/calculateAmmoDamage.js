/**
 * @param {import("../../../../../../../types/Items").AmmoDataSource} ammo
 */
export const calculateAmmoDamage = ammo =>
  Math.max(ammo.system.damage.base.value + ammo.system.quality.value * 2, 0);
