import { WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';

export const calculateWeaponPresence = (weapon: WeaponDataSource) =>
  Math.max(weapon.data.presence.base.value + weapon.data.quality.value * 10, 0);
