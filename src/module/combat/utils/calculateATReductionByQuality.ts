import type { GMCombatAttackResult } from '../../dialogs/combat/GMCombatDialog';
import { WeaponShotType } from '../../types/combat/WeaponItemConfig';

export const calculateATReductionByQuality = (result: GMCombatAttackResult): number => {
  let quality = 0;

  const { weapon } = result;

  if (weapon) {
    quality = weapon.data.quality.value;

    if (weapon.data.isRanged.value && weapon.data.shotType.value === WeaponShotType.SHOT) {
      quality = weapon.data.ammo?.data.quality.value ?? 0;
    }
  }

  if (quality <= 0) {
    return 0;
  }

  return Math.round(quality / 5);
};
