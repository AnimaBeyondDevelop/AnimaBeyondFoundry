import { EquippedHandType, ManageabilityType, WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';

export const getStrengthRequirement = (weapon: WeaponDataSource) => {
  switch (weapon.data.manageabilityType.value) {
    case ManageabilityType.ONE_HAND:
      return weapon.data.strRequired.oneHand.value;
    case ManageabilityType.TWO_HAND:
      return weapon.data.strRequired.twoHands.value;
    default:
      if (weapon.data.oneOrTwoHanded.value === EquippedHandType.ONE_HANDED) {
        return weapon.data.strRequired.oneHand.value;
      }

      return weapon.data.strRequired.twoHands.value;
  }
};
