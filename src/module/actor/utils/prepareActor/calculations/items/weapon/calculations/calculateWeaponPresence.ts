import { WeaponDataSource } from "../../../../../../../types/Items";

export const calculateWeaponPresence = (weapon: WeaponDataSource) =>
  Math.max(weapon.system.presence.base.value + weapon.system.quality.value * 10, 0);
