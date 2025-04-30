import { WeaponShotType } from '@module/data/items/enums/WeaponEnums';

export const calculateATReductionByQuality = result => {
  let quality = 0;

  const { weapon } = result;

  if (weapon) {
    quality = weapon.system.quality.value;

    if (
      weapon.system.isRanged.value &&
      weapon.system.shotType.value === WeaponShotType.SHOT
    ) {
      quality = weapon.system.ammo?.system.quality.value ?? 0;
    }
  }

  if (quality <= 0) {
    return 0;
  }

  return Math.round(quality / 5);
};
