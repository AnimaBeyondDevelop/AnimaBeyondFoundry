import { WeaponSizeProportion } from '../enums/WeaponEnums.js';

/** @type {(system: import('../mutateWeapon').WeaponItemData) => void} */
export const mutateStrRequired = system => {
  system.strRequired.oneHand.final.value = system.strRequired.oneHand.base.value;
  system.strRequired.twoHands.final.value = system.strRequired.twoHands.base.value;

  if (system.sizeProportion.value === WeaponSizeProportion.ENORMOUS) {
    system.strRequired.oneHand.final.value += 2;
    system.strRequired.twoHands.final.value += 2;
  }

  if (system.sizeProportion.value === WeaponSizeProportion.GIANT) {
    system.strRequired.oneHand.final.value += 5;
    system.strRequired.twoHands.final.value += 5;
  }
};
