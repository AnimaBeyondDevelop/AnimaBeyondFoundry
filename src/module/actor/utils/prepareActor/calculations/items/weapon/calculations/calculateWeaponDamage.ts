import {
  WeaponShotType,
  WeaponSizeProportion,
  BaseDamageCalculationType
} from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { calculateWeaponStrengthModifier } from '../util/calculateWeaponStrengthModifier';
import { WeaponDataSource } from '../../../../../../../types/Items';

const addSizeModifier = (weapon: WeaponDataSource, damage: number) => {
  if (weapon.system.sizeProportion.value === WeaponSizeProportion.ENORMOUS) {
    damage *= 1.5;

    damage = Math.floor(damage / 5) * 5;
  }

  if (weapon.system.sizeProportion.value === WeaponSizeProportion.GIANT) {
    damage *= 2;
  }

  return damage;
};

const getBaseDamage = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  let baseDamage = 0;

  switch (weapon.system.baseDamageCalculation?.value) {
    case BaseDamageCalculationType.DEFAULT:
      baseDamage = weapon.system.damage.base.value;
      break;
    case BaseDamageCalculationType.PRESENCE:
      baseDamage = data.general.presence.final.value;
      break;
    case BaseDamageCalculationType.DOUBLE_PRESENCE:
      baseDamage = data.general.presence.final.value * 2;
      break;
    default:
      baseDamage = 0;
  }
  return baseDamage;
};

export const calculateWeaponDamage = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  const getDamage = () => {
    const weaponStrengthModifier = calculateWeaponStrengthModifier(weapon, data);
    const extraDamage = data.combat.extraDamage.value;

    if (weapon.system.isRanged.value && weapon.system.shotType.value === WeaponShotType.SHOT) {
      const { ammo } = weapon.system;

      if (ammo) {
        let ammoDamage = ammo.system.damage.final.value - ammo.system.quality.value * 2;

        ammoDamage = addSizeModifier(weapon, ammoDamage);

        ammoDamage += ammo.system.quality.value * 2;

        return ammoDamage + weaponStrengthModifier + extraDamage;
      }

      return 0;
    }

    return addSizeModifier(weapon, getBaseDamage(weapon, data)) + weaponStrengthModifier + extraDamage + weapon.system.quality.value * 2;
  };

  return Math.max(getDamage(), 0);
};
