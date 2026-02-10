import {
  WeaponShotType,
  WeaponSizeProportion
} from '../../../../../../../types/combat/WeaponItemConfig';
import { calculateWeaponStrengthModifier } from '../util/calculateWeaponStrengthModifier';
import { FormulaEvaluator } from '../../../../../../../../utils/formulaEvaluator.js';

/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 * @param {number} damage
 */
const addSizeModifier = (weapon, damage) => {
  if (weapon.system.sizeProportion.value === WeaponSizeProportion.ENORMOUS) {
    damage *= 1.5;

    damage = Math.floor(damage / 5) * 5;
  }

  if (weapon.system.sizeProportion.value === WeaponSizeProportion.GIANT) {
    damage *= 2;
  }

  return damage;
};

/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const calculateWeaponDamage = (weapon, data) => {
  const getDamage = () => {
    const formula = weapon.system?.damage?.formula?.value?.trim();
    const useFormula = weapon.system?.useCustomFormula.value;

    if (useFormula && formula) {
      const fakeActor = { system: data };
      const value = FormulaEvaluator.evaluate(formula, fakeActor);

      if (value !== null && !Number.isNaN(value)) {
        const specialBonus = weapon.system.damage.special?.value ?? 0;
        const extraDamage = data.general.modifiers.extraDamage.final?.value ?? 0;

        const addQuality = weapon.system.damage.applyQualityInFormula?.value === true;
        const qualityBonus = addQuality ? (weapon.system.quality?.value ?? 0) * 2 : 0;

        return value + specialBonus + extraDamage + qualityBonus;
      }
    }

    const weaponStrengthModifier = calculateWeaponStrengthModifier(weapon, data);
    const extraDamage =
      data.general.modifiers.extraDamage.final.value + weapon.system.damage.special.value;

    if (
      weapon.system.isRanged.value &&
      weapon.system.shotType.value === WeaponShotType.SHOT
    ) {
      const { ammo } = weapon.system;

      if (ammo) {
        let ammoDamage = ammo.system.damage.final.value - ammo.system.quality.value * 2;

        ammoDamage = addSizeModifier(weapon, ammoDamage);

        ammoDamage += ammo.system.quality.value * 2;

        return ammoDamage + weaponStrengthModifier + extraDamage;
      }

      return 0;
    }

    return (
      addSizeModifier(weapon, weapon.system.damage.base.value) +
      weaponStrengthModifier +
      extraDamage +
      weapon.system.quality.value * 2
    );
  };

  return Math.max(getDamage(), 0);
};
