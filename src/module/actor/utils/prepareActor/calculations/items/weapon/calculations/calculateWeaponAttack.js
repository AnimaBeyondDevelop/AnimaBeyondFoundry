import { getWeaponKnowledgePenalty } from '../util/getWeaponKnowledgePenalty';
import { calculateStrengthRequiredPenalty } from '../util/calculateStrengthRequiredPenalty';

/**
 * @param {import('../../../../../../../types/Items').WeaponDataSource} weapon
 * @param {import('../../../../../../../types/Actor').ABFActorDataSourceData} data
 * @returns {number}
 */
export const calculateWeaponAttack = (weapon, data) =>
  data.combat.attack.final.value +
  weapon.system.attack.special.value +
  weapon.system.quality.value +
  getWeaponKnowledgePenalty(weapon) +
  calculateStrengthRequiredPenalty(weapon, data);
