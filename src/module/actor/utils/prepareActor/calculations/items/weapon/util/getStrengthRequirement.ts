import { WeaponEquippedHandType, WeaponManageabilityType, WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';

export const getStrengthRequirement = (weapon: WeaponDataSource) => {
  switch (weapon.data.manageabilityType.value) {
    case WeaponManageabilityType.ONE_HAND:
      return weapon.data.strRequired.oneHand.value;
    case WeaponManageabilityType.TWO_HAND:
      return weapon.data.strRequired.twoHands.value;
    default:
      if (weapon.data.oneOrTwoHanded.value === WeaponEquippedHandType.ONE_HANDED) {
        return weapon.data.strRequired.oneHand.value;
      }

      return weapon.data.strRequired.twoHands.value;
  }
};
