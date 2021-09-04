import { ShotType, WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { calculateWeaponStrengthModifier } from '../util/calculateWeaponStrengthModifier';

export const calculateWeaponDamage = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  const getDamage = () => {
    if (weapon.data.isRanged.value && weapon.data.shotType.value === ShotType.SHOT) {
      return weapon.data.ammo?.data.damage.final.value ?? 0;
    }

    return weapon.data.damage.base.value + weapon.data.quality.value * 2;
  };

  return Math.max(getDamage() + calculateWeaponStrengthModifier(weapon, data), 0);
};
