import { AmmoDataSource } from "../../../../../../../types/Items";
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getWeaponBreakingFromStrength } from '../../weapon/util/getWeaponBreakingFromStrength';

export const calculateAmmoBreaking = (ammo: AmmoDataSource, data: ABFActorDataSourceData) => {
  const strength = data.characteristics.primaries.strength.value;

  return (
    ammo.system.breaking.base.value +
    getWeaponBreakingFromStrength(strength) +
    Math.floor((ammo.system.quality.value / 5) * 2)
  );
};
