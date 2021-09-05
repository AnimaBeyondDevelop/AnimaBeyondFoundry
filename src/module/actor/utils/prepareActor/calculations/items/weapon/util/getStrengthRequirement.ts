import { WeaponEquippedHandType, WeaponManageabilityType, WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';

export const getStrengthRequirement = (weapon: WeaponDataSource) => {
  switch (weapon.data.manageabilityType.value) {
    case WeaponManageabilityType.ONE_HAND:
      return weapon.data.strRequired.oneHand.final.value;
    case WeaponManageabilityType.TWO_HAND:
      return weapon.data.strRequired.twoHands.final.value;
    default:
      if (weapon.data.oneOrTwoHanded.value === WeaponEquippedHandType.ONE_HANDED) {
        return weapon.data.strRequired.oneHand.final.value;
      }

      return weapon.data.strRequired.twoHands.final.value;
  }
};
