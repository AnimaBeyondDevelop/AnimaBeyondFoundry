import { WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getWeaponKnowledgePenalty } from '../util/getWeaponKnowledgePenalty';
import { calculateStrengthRequiredPenalty } from '../util/calculateStrengthRequiredPenalty';
import { calculateShieldBlockBonus } from '../../../actor/combat/calculations/calculateShieldBlockBonus';

export const calculateWeaponBlock = (weapon: WeaponDataSource, data: ABFActorDataSourceData) =>
  data.combat.block.final.value +
  weapon.system.block.special.value +
  weapon.system.quality.value +
  (weapon.system.isShield.value && weapon.system.equipped.value ? calculateShieldBlockBonus(weapon) : 0) +
  getWeaponKnowledgePenalty(weapon) +
  calculateStrengthRequiredPenalty(weapon, data);
