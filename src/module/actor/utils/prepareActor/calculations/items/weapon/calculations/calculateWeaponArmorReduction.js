import { WeaponSizeProportion } from '../../../../../../../types/combat/WeaponItemConfig';

/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 */
export const calculateWeaponArmorReduction = (weapon) => {
  let reducedArmor = weapon.system.reducedArmor.base.value + weapon.system.reducedArmor.special.value;


  return reducedArmor;
};