import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { WeaponDataSource } from '../../../../../../../types/Items';
import { getWeaponRangeFromStrength } from '../util/getWeaponRangeFromStrength';

export const calculateWeaponRange = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  const strength = weapon.system.hasOwnStr.value
    ? weapon.system.weaponStrength.final.value
    : data.characteristics.primaries.strength.value;

  const baseRange = weapon.system.range.base.value;

  const rangeFromStrength = getWeaponRangeFromStrength(strength);

  if (strength > 10 && weapon.system.quality.value < 5) {
    return baseRange + 50;
  }

  if ((strength === 12 || strength === 13) && weapon.system.quality.value < 10) {
    return baseRange + 100;
  }

  if ((strength === 14 || strength === 15) && weapon.system.quality.value < 15) {
    return baseRange + 500;
  }

  if (strength > 15 && weapon.system.quality.value < 20) {
    return baseRange + 5000;
  }

  if (rangeFromStrength !== undefined) {
    return Math.max(0, baseRange + rangeFromStrength);
  }

  return 0;
};
