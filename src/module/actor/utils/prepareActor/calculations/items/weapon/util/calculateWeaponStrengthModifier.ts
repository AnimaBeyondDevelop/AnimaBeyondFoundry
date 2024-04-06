import { WeaponEquippedHandType } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getCurrentEquippedHand } from './getCurrentEquippedHand';
import { calculateAttributeModifier } from '../../../util/calculateAttributeModifier';
import { WeaponDataSource } from '../../../../../../../types/Items';

export const calculateWeaponStrengthModifier = (weapon: WeaponDataSource, data: ABFActorDataSourceData) => {
  const hasOnlyOneEquippedHandMultiplier = getCurrentEquippedHand(weapon) === WeaponEquippedHandType.ONE_HANDED;
  const equippedHandMultiplier = hasOnlyOneEquippedHandMultiplier ? 1 : 2;

  if (weapon.system.hasOwnStr?.value) {
    return calculateAttributeModifier(weapon.system.weaponStrength.final.value);
  }

  const damageAttribute = weapon.system.damageAttribute?.value;
  const attributeModifier = data.characteristics.primaries[damageAttribute]?.mod ?? 0;

  return attributeModifier * equippedHandMultiplier;
};
