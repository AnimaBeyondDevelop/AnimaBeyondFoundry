import { calculateAttributeModifier } from '../..//util/calculateAttributeModifier';

export const mutateCombatData = data => {
  let attackStatBonus = data.combat.attack.applyStatBonus ? calculateAttributeModifier(data.characteristics.primaries.dexterity.value) : 0;
  data.combat.attack.final.value =
    data.combat.attack.base.value +
    attackStatBonus +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.final.value;

    let blockStatBonus = data.combat.block.applyStatBonus ? calculateAttributeModifier(data.characteristics.primaries.dexterity.value) : 0;
  data.combat.block.final.value =
    data.combat.block.base.value +
    blockStatBonus +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.final.value;

    let dodgeStatBonus = data.combat.dodge.applyStatBonus ? calculateAttributeModifier(data.characteristics.primaries.agility.value) : 0;
  data.combat.dodge.final.value =
    data.combat.dodge.base.value +
    dodgeStatBonus +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.final.value;
};
