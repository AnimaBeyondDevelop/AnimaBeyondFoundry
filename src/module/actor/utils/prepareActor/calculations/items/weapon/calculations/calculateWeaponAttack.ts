import { WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getWeaponKnowledgePenalty } from '../util/getWeaponKnowledgePenalty';
import { calculateStrengthRequiredPenalty } from '../util/calculateStrengthRequiredPenalty';

export const calculateWeaponAttack = (weapon: WeaponDataSource, data: ABFActorDataSourceData) =>
  data.combat.attack.final.value +
  weapon.system.attack.special.value +
  weapon.system.quality.value +
  getWeaponKnowledgePenalty(weapon) +
  calculateStrengthRequiredPenalty(weapon, data);
