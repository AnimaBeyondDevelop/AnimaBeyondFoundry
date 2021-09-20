import { ABFActorDataSourceData } from '../../../../../../types/Actor';
import { getEquippedWeapons } from '../../../utils/getEquippedWeapons';
import { calculateShieldBlockBonus } from './calculations/calculateShieldBlockBonus';

export const mutateCombatData = (data: ABFActorDataSourceData) => {
  data.combat.attack.final.value =
    data.combat.attack.base.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.value;

  const shield = getEquippedWeapons(data).filter(a => a.data.isShield.value)[0];

  const shieldBonus = shield ? calculateShieldBlockBonus(shield) : 0;

  data.combat.block.final.value =
    data.combat.block.base.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.value +
    shieldBonus;

  data.combat.dodge.final.value =
    data.combat.dodge.base.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.value;
};
