import { WeaponSize } from '../../../../../../../types/combat/WeaponItemConfig';

export const calculateShieldBlockBonus = shield => {
  switch (shield.system.size.value) {
    case WeaponSize.SMALL:
      return 10;
    case WeaponSize.MEDIUM:
      return 20;
    case WeaponSize.BIG:
      return 30;
    default:
      return 0;
  }
};
