import { WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';

export const calculateWeaponIntegrity = (weapon: WeaponDataSource) => {
  return weapon.data.integrity.base.value + weapon.data.quality.value * 2;
};
