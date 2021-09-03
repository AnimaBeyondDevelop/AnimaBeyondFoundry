import { WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';

export const calculateWeaponIntegrity = (weapon: WeaponDataSource) => {
  return Math.max(weapon.data.integrity.base.value + weapon.data.quality.value * 2, 0);
};
