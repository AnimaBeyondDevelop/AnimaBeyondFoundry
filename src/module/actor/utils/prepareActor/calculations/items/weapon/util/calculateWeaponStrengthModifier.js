import { WeaponEquippedHandType } from '../../../../../../../types/combat/WeaponItemConfig';
import { getCurrentEquippedHand } from './getCurrentEquippedHand';
import { calculateAttributeModifier } from '../../../util/calculateAttributeModifier';

/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const calculateWeaponStrengthModifier = (weapon, data) => {
  const hasOnlyOneEquippedHandMultiplier =
    getCurrentEquippedHand(weapon) === WeaponEquippedHandType.ONE_HANDED;

  const StrengthModifier = data.characteristics.primaries.strength.mod;
  const equippedHandMultiplier =
    hasOnlyOneEquippedHandMultiplier || StrengthModifier < 0 ? 1 : 2;

  if (weapon.system.hasOwnStr?.value) {
    return calculateAttributeModifier(weapon.system.weaponStrength.final.value);
  }
  return StrengthModifier * equippedHandMultiplier;
};
