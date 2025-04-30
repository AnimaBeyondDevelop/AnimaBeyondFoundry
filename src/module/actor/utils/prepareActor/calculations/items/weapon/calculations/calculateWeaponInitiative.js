import { WeaponSizeProportion } from '@module/data/items/enums/WeaponEnums';

/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 */
export const calculateWeaponInitiative = weapon => {
  let initiative = weapon.system.initiative.base.value + weapon.system.quality.value;

  // This depends on the size of the character but right now is not automatized
  if (weapon.system.sizeProportion.value !== WeaponSizeProportion.NORMAL) {
    initiative -= 40;
  }

  return initiative;
};
