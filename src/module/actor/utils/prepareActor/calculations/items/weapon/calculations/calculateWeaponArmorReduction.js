import { WeaponSizeProportion } from '../../../../../../../types/combat/WeaponItemConfig';

/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 */
export const calculateWeaponArmorReduction = weapon => {
  let reducedArmor = Math.max(
    weapon.system.reducedArmor.base.value + weapon.system.reducedArmor.special.value,
    0
  );

  return reducedArmor;
};
