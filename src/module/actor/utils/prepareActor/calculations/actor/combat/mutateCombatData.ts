import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { getEquippedWeapons } from '../../../utils/getEquippedWeapons';
import { calculateShieldBlockBonus } from './calculations/calculateShieldBlockBonus';

export const mutateCombatData = (data: ABFActorDataSourceData) => {
  data.combat.attack.final.value =
    data.combat.attack.base.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.value;

  data.combat.block.final.value =
    data.combat.block.base.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.value;

  data.combat.dodge.final.value =
    data.combat.dodge.base.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.value;
};
