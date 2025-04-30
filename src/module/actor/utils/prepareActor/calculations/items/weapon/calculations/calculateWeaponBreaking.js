import { WeaponSizeProportion } from '@module/data/items/enums/WeaponEnums';
import { getWeaponBreakingFromStrength } from '../util/getWeaponBreakingFromStrength';

/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const calculateWeaponBreaking = (weapon, data) => {
  const strength = data.characteristics.primaries.strength.value;

  let breaking =
    weapon.system.breaking.base.value +
    getWeaponBreakingFromStrength(strength) +
    Math.floor((weapon.system.quality.value / 5) * 2);

  if (weapon.system.sizeProportion.value === WeaponSizeProportion.ENORMOUS) {
    breaking += 3;
  }

  if (weapon.system.sizeProportion.value === WeaponSizeProportion.ENORMOUS) {
    breaking += 8;
  }

  return breaking;
};
