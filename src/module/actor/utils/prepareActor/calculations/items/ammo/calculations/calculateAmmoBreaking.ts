import { AmmoDataSource } from '../../../../../../../types/combat/AmmoItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getWeaponBreakingFromStrength } from '../../weapon/util/getWeaponBreakingFromStrength';

export const calculateAmmoBreaking = (ammo: AmmoDataSource, data: ABFActorDataSourceData) => {
  const strength = data.characteristics.primaries.strength.value;

  return (
    ammo.data.breaking.base.value +
    getWeaponBreakingFromStrength(strength) +
    Math.floor((ammo.data.quality.value / 5) * 2)
  );
};
