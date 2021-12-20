import { WeaponDataSource, WeaponEquippedHandType } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getCurrentEquippedHand } from './getCurrentEquippedHand';
import { calculateAttributeModifier } from '../../../util/calculateAttributeModifier';

export const calculateWeaponStrengthModifier = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  const hasOnlyOneEquippedHandMultiplier =
    getCurrentEquippedHand(weapon) === WeaponEquippedHandType.ONE_HANDED || weapon.data.isRanged.value;

  const equippedHandMultiplier = hasOnlyOneEquippedHandMultiplier ? 1 : 2;

  if (weapon.data.hasOwnStr.value) {
    return calculateAttributeModifier(weapon.data.weaponStrength.final.value);
  }

  return data.characteristics.primaries.strength.mod * equippedHandMultiplier;
};
