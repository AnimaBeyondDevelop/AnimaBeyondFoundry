import { EquippedHandType, ShotType, WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getCurrentEquippedHand } from './getCurrentEquippedHand';
import { calculateAttributeModifier } from '../../../util/calculateAttributeModifier';

export const calculateWeaponStrengthModifier = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  const hasOnlyOneEquippedHandMultiplier =
    getCurrentEquippedHand(weapon) === EquippedHandType.ONE_HANDED || weapon.data.isRanged.value;

  const equippedHandMultiplier = hasOnlyOneEquippedHandMultiplier ? 1 : 2;

  if (weapon.data.isRanged.value && weapon.data.shotType.value === ShotType.SHOT && weapon.data.hasOwnStr.value) {
    return calculateAttributeModifier(weapon.data.weaponFue.value);
  }

  return data.characteristics.primaries.strength.mod * equippedHandMultiplier;
};
