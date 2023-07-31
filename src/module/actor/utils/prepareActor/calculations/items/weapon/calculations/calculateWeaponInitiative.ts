import { WeaponSizeProportion } from '../../../../../../../types/combat/WeaponItemConfig';
import { WeaponDataSource } from '../../../../../../../types/Items';

export const calculateWeaponInitiative = (weapon: WeaponDataSource) => {
  let initiative = weapon.system.initiative.base.value + weapon.system.quality.value;

  // This depends on the size of the character but right now is not automatized
  if (weapon.system.sizeProportion.value !== WeaponSizeProportion.NORMAL) {
    initiative -= 40;
  }

  return initiative;
};
