export const Templates = {
  Dialog: {
    ModDialog: 'systems/animabf/templates/dialog/mod-dialog.html',
    DamageCalculator: 'systems/animabf/templates/dialog/damage-calculator.hbs',
    Combat: {
      UserCombatAttackDialog: {
        main: 'systems/animabf/templates/dialog/combat/user-combat-attack/user-combat-attack-dialog.hbs',
        parts: {
          combat: 'systems/animabf/templates/dialog/combat/user-combat-attack/parts/combat.hbs',
          mystic: 'systems/animabf/templates/dialog/combat/user-combat-attack/parts/mystic.hbs',
          psychic: 'systems/animabf/templates/dialog/combat/user-combat-attack/parts/psychic.hbs',
        }
      },
      UserCombatDefenseDialog: {
        main: 'systems/animabf/templates/dialog/combat/user-combat-defense/user-combat-defense-dialog.hbs',
        parts: {
          combat: 'systems/animabf/templates/dialog/combat/user-combat-defense/parts/combat.hbs',
          mystic: 'systems/animabf/templates/dialog/combat/user-combat-defense/parts/mystic.hbs',
          psychic: 'systems/animabf/templates/dialog/combat/user-combat-defense/parts/psychic.hbs',
        }
      },
      CombatRequestDialog: 'systems/animabf/templates/dialog/combat/combat-request-dialog.hbs',
      GMCombatDialog: 'systems/animabf/templates/dialog/combat/gm-combat-dialog.hbs'
    },
    Icons: {
      Accept: 'systems/animabf/templates/dialog/parts/check-icon.hbs',
      Cancel: 'systems/animabf/templates/dialog/parts/cancel-icon.hbs'
    }
  }
};
