import { WeaponDataSource, WeaponSizeProportion } from '../../../../../../../types/combat/WeaponItemConfig';

export const calculateWeaponIntegrity = (weapon: WeaponDataSource) => {
  let integrity = weapon.data.integrity.base.value + weapon.data.quality.value * 2;

  if (weapon.data.sizeProportion.value === WeaponSizeProportion.ENORMOUS) {
    integrity += 6;
  }

  if (weapon.data.sizeProportion.value === WeaponSizeProportion.ENORMOUS) {
    integrity += 16;
  }

  return Math.max(integrity, 0);
};
