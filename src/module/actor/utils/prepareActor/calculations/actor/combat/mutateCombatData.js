export const mutateCombatData = data => {
  // Re-enabled: attack.final must include allActions and physicalActions so
  // that AE penalizing those modifiers (Ceguera parcial, Derribado,
  // Amenazado, etc.) actually reach the attack roll. AE that target
  // attack.final directly (Sangre de Orochi, Berserker, ...) still apply on
  // top because the flow toposort runs overwrite ops (this function) before
  // modify ops (the AE 'add' changes) for the same path.
  data.combat.attack.final.value =
    data.combat.attack.base.value +
    data.combat.attack.special.value +
    data.general.modifiers.allActions.final.value +
    data.general.modifiers.physicalActions.final.value;

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
    'system.combat.attack.base.value',
    'system.combat.attack.special.value',
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
    'system.combat.attack.final.value',
    'system.combat.block.final.value',
    'system.combat.dodge.final.value'
    // 'system.combat.damageReduction.final.value'
  ]
};
