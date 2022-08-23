import {
  WeaponDataSource,
  WeaponShotType,
  WeaponSizeProportion
} from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { calculateWeaponStrengthModifier } from '../util/calculateWeaponStrengthModifier';

const addSizeModifier = (weapon: WeaponDataSource, damage: number) => {
  if (weapon.data.sizeProportion.value === WeaponSizeProportion.ENORMOUS) {
    damage *= 1.5;

    damage = Math.floor(damage / 5) * 5;
  }

  if (weapon.data.sizeProportion.value === WeaponSizeProportion.GIANT) {
    damage *= 2;
  }

  return damage;
};

export const calculateWeaponDamage = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  const getDamage = () => {
    const weaponStrengthModifier = calculateWeaponStrengthModifier(weapon, data);
    const extraDamage = data.general.modifiers.extraDamage.value

    if (weapon.data.isRanged.value && weapon.data.shotType.value === WeaponShotType.SHOT) {
      const { ammo } = weapon.data;

      if (ammo) {
        let ammoDamage = ammo.data.damage.final.value - ammo.data.quality.value * 2;

        ammoDamage = addSizeModifier(weapon, ammoDamage);

        ammoDamage += ammo.data.quality.value * 2;

        return ammoDamage + weaponStrengthModifier + extraDamage;
      }

      return 0;
    }

    return addSizeModifier(weapon, weapon.data.damage.base.value) + weaponStrengthModifier + extraDamage + weapon.data.quality.value * 2;
  };

  return Math.max(getDamage(), 0);
};
