import { WeaponItemData, WeaponSize } from '../../../../../types/combat/WeaponItemConfig';

export const mutateStrRequired = (data: WeaponItemData) => {
  data.strRequired.oneHand.final.value = data.strRequired.oneHand.base.value;
  data.strRequired.twoHands.final.value = data.strRequired.twoHands.base.value;

  if (data.size.value === WeaponSize.ENORMOUS) {
    data.strRequired.oneHand.final.value += 2;
    data.strRequired.twoHands.final.value += 2;
  }

  if (data.size.value === WeaponSize.GIANT) {
    data.strRequired.oneHand.final.value += 5;
    data.strRequired.twoHands.final.value += 5;
  }
};
