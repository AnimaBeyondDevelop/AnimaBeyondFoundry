import { WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';

export const getWeaponBaseDamage = (weapon: WeaponDataSource) => {
  if (weapon.data.isRanged.value) {
    return weapon.data.ammo?.data.damage.value ?? 0;
  }

  return weapon.data.damage.base.value;
};
