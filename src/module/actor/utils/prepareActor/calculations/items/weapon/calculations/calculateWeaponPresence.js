/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 */
export const calculateWeaponPresence = weapon =>
  Math.max(weapon.system.presence.base.value + weapon.system.quality.value * 10, 0);
