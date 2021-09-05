import { WeaponDataSource, WeaponSizeProportion } from '../../../../../../../types/combat/WeaponItemConfig';

export const calculateWeaponInitiative = (weapon: WeaponDataSource) => {
  let initiative = weapon.data.initiative.base.value + weapon.data.quality.value;

  // This depends on the size of the character but right now is not automatized
  if (weapon.data.sizeProportion.value !== WeaponSizeProportion.NORMAL) {
    initiative -= 40;
  }

  return initiative;
};
