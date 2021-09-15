export const Templates = {
  Dialog: {
    ModDialog: 'systems/animabf/templates/dialog/mod-dialog.html',
    DamageCalculator: 'systems/animabf/templates/dialog/damage-calculator.hbs',
    Combat: {
      CombatAttackDialog: {
        main: 'systems/animabf/templates/dialog/combat/combat-attack/combat-attack-dialog.hbs',
        parts: {
          combat: 'systems/animabf/templates/dialog/combat/combat-attack/parts/combat.hbs',
          mystic: 'systems/animabf/templates/dialog/combat/combat-attack/parts/mystic.hbs',
          psychic: 'systems/animabf/templates/dialog/combat/combat-attack/parts/psychic.hbs'
        }
      },
      CombatDefenseDialog: {
        main: 'systems/animabf/templates/dialog/combat/combat-defense/combat-defense-dialog.hbs',
        parts: {
          combat: 'systems/animabf/templates/dialog/combat/combat-defense/parts/combat.hbs',
          mystic: 'systems/animabf/templates/dialog/combat/combat-defense/parts/mystic.hbs',
          psychic: 'systems/animabf/templates/dialog/combat/combat-defense/parts/psychic.hbs'
        }
      },
      CombatRequestDialog: 'systems/animabf/templates/dialog/combat/combat-request-dialog.hbs',
      GMCombatDialog: 'systems/animabf/templates/dialog/combat/gm-combat-dialog.hbs'
    },
    GenericDialog: 'systems/animabf/templates/dialog/generic-dialog/generic-dialog.hbs',
    Icons: {
      Accept: 'systems/animabf/templates/dialog/parts/check-icon.hbs',
      Cancel: 'systems/animabf/templates/dialog/parts/cancel-icon.hbs'
    }
  },
  CustomHotBar: 'systems/animabf/templates/custom-hotbar/custom-hotbar.hbs',
  Chat: {
    CombatResult: 'systems/animabf/templates/chat/combat-result.hbs'
  }
};
