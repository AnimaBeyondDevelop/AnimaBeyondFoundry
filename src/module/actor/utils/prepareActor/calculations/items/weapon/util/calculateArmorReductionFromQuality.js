import { WeaponEquippedHandType } from '../../../../../../../types/combat/WeaponItemConfig';
import { getCurrentEquippedHand } from '../util/getCurrentEquippedHand';
import { calculateAttributeModifier } from '../../../util/calculateAttributeModifier';
import { WeaponShotType } from '../../../../../../../types/combat/WeaponItemConfig';

/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 */
export const calculateArmorReductionFromQuality = (weapon) => {
  let quality = 0;

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