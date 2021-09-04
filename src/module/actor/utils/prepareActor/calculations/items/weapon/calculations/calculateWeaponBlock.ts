import { WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getWeaponKnowledgePenalty } from '../util/getWeaponKnowledgePenalty';
import { calculateStrengthRequiredPenalty } from '../util/calculateStrengthRequiredPenalty';

export const calculateWeaponBlock = (weapon: WeaponDataSource, data: ABFActorDataSourceData) =>
  data.combat.block.final.value +
  weapon.data.quality.value +
  getWeaponKnowledgePenalty(weapon) +
  calculateStrengthRequiredPenalty(weapon, data);
