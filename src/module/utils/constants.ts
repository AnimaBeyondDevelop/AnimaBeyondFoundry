export const Templates = {
  Dialog: {
    ModDialog: 'systems/animabf/templates/dialog/mod-dialog.html',
    DamageCalculator: 'systems/animabf/templates/dialog/damage-calculator.hbs',
    MysticAct: 'systems/animabf/templates/dialog/mystic-act.hbs',
    MysticCast: 'systems/animabf/templates/dialog/mystic-cast.hbs',
    newPreparedSpell: 'systems/animabf/templates/dialog/new-prepared-spell.hbs',
    newMaintainedSpell: 'systems/animabf/templates/dialog/new-maintained-spell.hbs',
    newSupernaturalShield: {
      main: 'systems/animabf/templates/dialog/new-supernatural-shield/new-supernatural-shield.hbs',
      parts: {
        mystic:
          'systems/animabf/templates/dialog/new-supernatural-shield/parts/new-mystic-shield.hbs',
        psychic:
          'systems/animabf/templates/dialog/new-supernatural-shield/parts/new-psychic-shield.hbs'
      }
    },
    newActVia: 'systems/animabf/templates/dialog/new-act-via.hbs',
    newPsychicDiscipline: 'systems/animabf/templates/dialog/new-psychic-discipline.hbs',
    newMentalPattern: 'systems/animabf/templates/dialog/new-mental-pattern.hbs',
    Combat: {
      CombatAttackDialog: {
        main: 'systems/animabf/templates/dialog/combat/combat-attack/combat-attack-dialog.hbs',
        parts: {
          combat:
            'systems/animabf/templates/dialog/combat/combat-attack/parts/combat.hbs',
          mystic:
            'systems/animabf/templates/dialog/combat/combat-attack/parts/mystic.hbs',
          psychic:
            'systems/animabf/templates/dialog/combat/combat-attack/parts/psychic.hbs'
        }
      },
      CombatDefenseDialog: {
        main: 'systems/animabf/templates/dialog/combat/combat-defense/combat-defense-dialog.hbs',
        parts: {
          combat:
            'systems/animabf/templates/dialog/combat/combat-defense/parts/combat.hbs',
          damageResistance:
            'systems/animabf/templates/dialog/combat/combat-defense/parts/damage-resistance.hbs',
          mystic:
            'systems/animabf/templates/dialog/combat/combat-defense/parts/mystic.hbs',
          psychic:
            'systems/animabf/templates/dialog/combat/combat-defense/parts/psychic.hbs'
        }
      },
      CombatRequestDialog:
        'systems/animabf/templates/dialog/combat/combat-request-dialog.hbs',
      GMCombatDialog: 'systems/animabf/templates/dialog/combat/gm-combat-dialog.hbs',
      RollRequestDialog: 'systems/animabf/templates/dialog/combat/roll-request-dialog.hbs'
    },
    GenericDialog: 'systems/animabf/templates/dialog/generic-dialog/generic-dialog.hbs',
    Icons: {
      Accept: 'systems/animabf/templates/dialog/parts/check-icon.hbs',
      Cancel: 'systems/animabf/templates/dialog/parts/cancel-icon.hbs'
    }
  },
  CustomHotBar: 'systems/animabf/templates/custom-hotbar/custom-hotbar.hbs',
  Chat: {
    CombatResult: 'systems/animabf/templates/chat/combat-result.hbs',
    CheckResult: 'systems/animabf/templates/chat/check-result.hbs'
  }
};
