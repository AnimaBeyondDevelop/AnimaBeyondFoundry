import { WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getWeaponKnowledgePenalty } from '../util/getWeaponKnowledgePenalty';
import { calculateStrengthRequiredPenalty } from '../util/calculateStrengthRequiredPenalty';
import { calculateShieldBlockBonus } from '../../../actor/combat/calculations/calculateShieldBlockBonus';

export const calculateWeaponBlock = (weapon: WeaponDataSource, data: ABFActorDataSourceData) =>
  data.combat.block.final.value +
  weapon.data.block.special.value +
  weapon.data.quality.value +
  (weapon.data.isShield.value && weapon.data.equipped.value ? calculateShieldBlockBonus(weapon) : 0) +
  getWeaponKnowledgePenalty(weapon) +
  calculateStrengthRequiredPenalty(weapon, data);
