import { WeaponDataSource, WeaponSize } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getWeaponBreakingFromStrength } from '../util/getWeaponBreakingFromStrength';

export const calculateWeaponBreaking = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  const strength = data.characteristics.primaries.strength.value;

  let breaking =
    weapon.data.breaking.base.value +
    getWeaponBreakingFromStrength(strength) +
    Math.floor((weapon.data.quality.value / 5) * 2);

  if (weapon.data.size.value === WeaponSize.ENORMOUS) {
    breaking += 3;
  }

  if (weapon.data.size.value === WeaponSize.ENORMOUS) {
    breaking += 8;
  }

  return breaking;
};
