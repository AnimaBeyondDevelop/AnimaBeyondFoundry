import { WeaponItemData, WeaponSizeProportion } from '../../../../../types/combat/WeaponItemConfig';

export const mutateStrRequired = (data: WeaponItemData) => {
  data.strRequired.oneHand.final.value = data.strRequired.oneHand.base.value;
  data.strRequired.twoHands.final.value = data.strRequired.twoHands.base.value;

  if (data.sizeProportion.value === WeaponSizeProportion.ENORMOUS) {
    data.strRequired.oneHand.final.value += 2;
    data.strRequired.twoHands.final.value += 2;
  }

  if (data.sizeProportion.value === WeaponSizeProportion.GIANT) {
    data.strRequired.oneHand.final.value += 5;
    data.strRequired.twoHands.final.value += 5;
  }
};
