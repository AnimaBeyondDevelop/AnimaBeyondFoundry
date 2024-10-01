import { getWeaponKnowledgePenalty } from '../util/getWeaponKnowledgePenalty';
import { calculateStrengthRequiredPenalty } from '../util/calculateStrengthRequiredPenalty';
import { calculateShieldBlockBonus } from '../../../actor/combat/calculations/calculateShieldBlockBonus';

/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const calculateWeaponBlock = (weapon, data) =>
  data.combat.block.final.value +
  weapon.system.block.special.value +
  weapon.system.quality.value +
  (weapon.system.isShield.value && weapon.system.equipped.value
    ? calculateShieldBlockBonus(weapon)
    : 0) +
  getWeaponKnowledgePenalty(weapon) +
  calculateStrengthRequiredPenalty(weapon, data);
