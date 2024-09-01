import {
  WeaponEquippedHandType,
  WeaponManageabilityType
} from '../../../../../../../types/combat/WeaponItemConfig';

/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 */
export const getCurrentEquippedHand = weapon => {
  switch (weapon.system.manageabilityType.value) {
    case WeaponManageabilityType.ONE_HAND:
      return WeaponEquippedHandType.ONE_HANDED;
    case WeaponManageabilityType.TWO_HAND:
      return WeaponEquippedHandType.TWO_HANDED;
    default:
      return weapon.system.oneOrTwoHanded.value;
  }
};
