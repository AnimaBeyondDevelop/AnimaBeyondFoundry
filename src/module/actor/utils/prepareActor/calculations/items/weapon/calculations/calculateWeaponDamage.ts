import { WeaponDataSource, WeaponShotType, WeaponSize } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { calculateWeaponStrengthModifier } from '../util/calculateWeaponStrengthModifier';

const addSizeModifier = (weapon: WeaponDataSource, damage: number) => {
  if (weapon.data.size.value === WeaponSize.ENORMOUS) {
    damage *= 1.5;

    damage = Math.floor(damage / 5) * 5;
  }

  if (weapon.data.size.value === WeaponSize.GIANT) {
    damage *= 2;
  }

  return damage;
};

export const calculateWeaponDamage = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  const getDamage = () => {
    if (weapon.data.isRanged.value && weapon.data.shotType.value === WeaponShotType.SHOT) {
      const { ammo } = weapon.data;

      if (ammo) {
        let ammoDamage = ammo.data.damage.final.value - ammo.data.quality.value * 2;

        ammoDamage = addSizeModifier(weapon, ammoDamage);

        ammoDamage += ammo.data.quality.value * 2;

        return ammoDamage;
      }

      return 0;
    }

    const baseDamage = weapon.data.damage.base.value + calculateWeaponStrengthModifier(weapon, data);

    return addSizeModifier(weapon, baseDamage) + weapon.data.quality.value * 2;
  };

  return Math.max(getDamage(), 0);
};
