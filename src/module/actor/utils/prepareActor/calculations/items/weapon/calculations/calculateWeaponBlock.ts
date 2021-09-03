import { WeaponDataSource } from '../../../../../../../types/combat/WeaponItemConfig';
import { ABFActorDataSourceData } from '../../../../../../../types/Actor';
import { getWeaponKnowledgePenalty } from '../util/getWeaponKnowledgePenalty';
import { calculateStrengthRequiredPenalty } from '../util/calculateStrengthRequiredPenalty';

export const calculateWeaponBlock = (weapon: WeaponDataSource, data: ABFActorDataSourceData) =>
  data.combat.block.value +
  weapon.data.quality.value +
  getWeaponKnowledgePenalty(weapon) +
  data.general.modifiers.allActions.value +
  data.general.modifiers.physicalActions.value +
  calculateStrengthRequiredPenalty(weapon, data);
