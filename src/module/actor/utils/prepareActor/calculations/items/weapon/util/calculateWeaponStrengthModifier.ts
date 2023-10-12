import { 
  WeaponEquippedHandType,
  Attribute
 } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getCurrentEquippedHand } from './getCurrentEquippedHand';
import { calculateAttributeModifier } from '../../../util/calculateAttributeModifier';
import { WeaponDataSource } from '../../../../../../../types/Items';

export const calculateWeaponStrengthModifier = (weapon, data) => {
  const hasOnlyOneEquippedHandMultiplier = getCurrentEquippedHand(weapon) === WeaponEquippedHandType.ONE_HANDED;
  const equippedHandMultiplier = hasOnlyOneEquippedHandMultiplier ? 1 : 2;
  if (weapon.system.hasOwnStr.value) {
      return calculateAttributeModifier(weapon.system.weaponStrength.final.value);
  }
  let attributeModifier = 0;
  switch (weapon.system.damageAttribute.value) {
      case Attribute.AGI:
          attributeModifier = data.characteristics.primaries.agility.mod;
          break;
      case Attribute.CON:
          attributeModifier = data.characteristics.primaries.constitution.mod;
          break;
      case Attribute.DEX:
          attributeModifier = data.characteristics.primaries.dexterity.mod;
          break;
      case Attribute.STR:
          attributeModifier = data.characteristics.primaries.strength.mod;
          break;
      case Attribute.INT:
          attributeModifier = data.characteristics.primaries.intelligence.mod;
          break;
      case Attribute.PER:
          attributeModifier = data.characteristics.primaries.perception.mod;
          break;
      case Attribute.POW:
          attributeModifier = data.characteristics.primaries.power.mod;
          break;
      case Attribute.WP:
          attributeModifier = data.characteristics.primaries.willPower.mod;
          break;
      default:
          attributeModifier = 0;
  }
  return attributeModifier * equippedHandMultiplier;
};
