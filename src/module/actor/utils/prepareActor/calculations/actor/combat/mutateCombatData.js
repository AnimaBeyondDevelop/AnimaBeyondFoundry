export const mutateCombatData = data => {
  // attack.final.value is intentionally NOT calculated here.
  // physicalActions only applies to secondary skills contested between two
  // subjects (per the Anima Beyond Fantasy core rules). Combat actions
  // (attack, block, dodge) are primary skills and do not receive the
  // physicalActions modifier through this path.
  // See: rule about "modificador a acciones físicas".
  // data.combat.attack.final.value =
  //   data.combat.attack.base.value +
  //   data.combat.attack.special.value +
  //   data.general.modifiers.allActions.final.value +
  //   data.general.modifiers.physicalActions.final.value;

  data.combat.block.final.value =
    data.combat.block.base.value +
    data.combat.block.special.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.final.value;

  data.combat.dodge.final.value =
    data.combat.dodge.base.value +
    data.combat.dodge.special.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.final.value;

  // data.combat.damageReduction.final.value =
  //   data.combat.damageReduction.base.value + data.combat.damageReduction.special.value;
};

mutateCombatData.abfFlow = {
  deps: [
    // 'system.combat.attack.base.value',
    // 'system.combat.attack.special.value',
    'system.combat.block.base.value',
    'system.combat.block.special.value',
    'system.combat.dodge.base.value',
    'system.combat.dodge.special.value',
    // 'system.combat.damageReduction.base.value',
    // 'system.combat.damageReduction.special.value',
    'system.general.modifiers.allActions.final.value',
    'system.general.modifiers.physicalActions.final.value'
  ],
  mods: [
    // 'system.combat.attack.final.value',
    'system.combat.block.final.value',
    'system.combat.dodge.final.value'
    // 'system.combat.damageReduction.final.value'
  ]
};
