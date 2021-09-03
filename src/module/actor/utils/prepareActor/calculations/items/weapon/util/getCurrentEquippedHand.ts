import { EquippedHandType, ManageabilityType, WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';

export const getCurrentEquippedHand = (weapon: WeaponDataSource): EquippedHandType => {
  switch (weapon.data.manageabilityType.value) {
    case ManageabilityType.ONE_HAND:
      return EquippedHandType.ONE_HANDED;
    case ManageabilityType.TWO_HAND:
      return EquippedHandType.TWO_HANDED;
    default:
      return weapon.data.oneOrTwoHanded.value;
  }
};
