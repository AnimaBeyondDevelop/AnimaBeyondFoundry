import {
  ArmorType,
  ArmorLocation
} from '../../../../../../../types/combat/ArmorItemConfig';

/**
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 * @returns {number}
 */
export const calculateEquippedArmorsNaturalPenalty = data => {
  /** @type {{armors: import('../../../../../../../types/Items').ArmorDataSource[]}} */
  const combat = data.combat;

  const equippedArmorsNonNatural = combat.armors.filter(
    armor =>
      armor.system.equipped.value &&
      armor.system.type.value !== ArmorType.NATURAL &&
      armor.system.localization.value !== ArmorLocation.HEAD
  );

  return Math.min(0, (equippedArmorsNonNatural.length - 1) * -20);
};
