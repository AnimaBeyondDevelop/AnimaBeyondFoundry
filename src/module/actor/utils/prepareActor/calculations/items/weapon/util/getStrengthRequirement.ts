import { WeaponEquippedHandType, WeaponManageabilityType, WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';

export const getStrengthRequirement = (weapon: WeaponDataSource) => {
  switch (weapon.system.manageabilityType.value) {
    case WeaponManageabilityType.ONE_HAND:
      return weapon.system.strRequired.oneHand.final.value;
    case WeaponManageabilityType.TWO_HAND:
      return weapon.system.strRequired.twoHands.final.value;
    default:
      if (weapon.system.oneOrTwoHanded.value === WeaponEquippedHandType.ONE_HANDED) {
        return weapon.system.strRequired.oneHand.final.value;
      }

      return weapon.system.strRequired.twoHands.final.value;
  }
};
