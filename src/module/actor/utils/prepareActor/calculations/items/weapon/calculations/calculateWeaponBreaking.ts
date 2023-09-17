import { WeaponSizeProportion } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getWeaponBreakingFromStrength } from '../util/getWeaponBreakingFromStrength';
import { WeaponDataSource } from '../../../../../../../types/Items';

export const calculateWeaponBreaking = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
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
