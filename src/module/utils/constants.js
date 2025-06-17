export const Templates = {
  Dialog: {
    ModDialog: 'systems/abf/templates/dialog/mod-dialog.html',
    DamageCalculator: 'systems/abf/templates/dialog/damage-calculator.hbs',
    newPreparedSpell: 'systems/abf/templates/dialog/new-prepared-spell.hbs',
    newSupernaturalShield: {
      main: 'systems/abf/templates/dialog/new-supernatural-shield/new-supernatural-shield.hbs',
      parts: {
        mystic:
          'systems/abf/templates/dialog/new-supernatural-shield/parts/new-mystic-shield.hbs',
        psychic:
          'systems/abf/templates/dialog/new-supernatural-shield/parts/new-psychic-shield.hbs'
      }
    },
    newActVia: 'systems/abf/templates/dialog/new-act-via.hbs',
    newPsychicDiscipline: 'systems/abf/templates/dialog/new-psychic-discipline.hbs',
    newMentalPattern: 'systems/abf/templates/dialog/new-mental-pattern.hbs',
    Combat: {
      CombatAttackDialog: {
        main: 'systems/abf/templates/dialog/combat/combat-attack/combat-attack-dialog.hbs',
        parts: {
          combat:
            'systems/abf/templates/dialog/combat/combat-attack/parts/combat.hbs',
          mystic:
            'systems/abf/templates/dialog/combat/combat-attack/parts/mystic.hbs',
          psychic:
            'systems/abf/templates/dialog/combat/combat-attack/parts/psychic.hbs'
        }
      },
      CombatDefenseDialog: {
        main: 'systems/abf/templates/dialog/combat/combat-defense/combat-defense-dialog.hbs',
        parts: {
          combat:
            'systems/abf/templates/dialog/combat/combat-defense/parts/combat.hbs',
          damageResistance:
            'systems/abf/templates/dialog/combat/combat-defense/parts/damage-resistance.hbs',
          mystic:
            'systems/abf/templates/dialog/combat/combat-defense/parts/mystic.hbs',
          psychic:
            'systems/abf/templates/dialog/combat/combat-defense/parts/psychic.hbs'
        }
      },
      CombatRequestDialog:
        'systems/abf/templates/dialog/combat/combat-request-dialog.hbs',
      GMCombatDialog: 'systems/abf/templates/dialog/combat/gm-combat-dialog.hbs'
    },
    GenericDialog: 'systems/abf/templates/dialog/generic-dialog/generic-dialog.hbs',
    Icons: {
      Accept: 'systems/abf/templates/dialog/parts/check-icon.hbs',
      Cancel: 'systems/abf/templates/dialog/parts/cancel-icon.hbs'
    }
  },
  CustomHotBar: 'systems/abf/templates/custom-hotbar/custom-hotbar.hbs',
  Chat: {
    CombatResult: 'systems/abf/templates/chat/combat-result.hbs'
  }
};
