import { WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getWeaponBreakingFromStrength } from '../util/getWeaponBreakingFromStrength';

export const calculateWeaponBreaking = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  const strength = data.characteristics.primaries.strength.value;

  return (
    weapon.data.breaking.base.value +
    getWeaponBreakingFromStrength(strength) +
    Math.floor((weapon.data.quality.value / 5) * 2)
  );
};
