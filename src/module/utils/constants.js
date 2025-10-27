// module/utils/constants.js
import { System } from '../../utils/systemMeta.js';

// Helper to build template paths dynamically
const T = p => `systems/${System.id}/templates/${p}`;

export const Templates = {
  Dialog: {
    ModDialog: T('dialog/mod-dialog.html'),
    DamageCalculator: T('dialog/damage-calculator.hbs'),
    newPreparedSpell: T('dialog/new-prepared-spell.hbs'),
    newSelectedSpell: T('dialog/new-selected-spell.hbs'),
    newSupernaturalShield: {
      main: T('dialog/new-supernatural-shield/new-supernatural-shield.hbs'),
      parts: {
        mystic: T('dialog/new-supernatural-shield/parts/new-mystic-shield.hbs'),
        psychic: T('dialog/new-supernatural-shield/parts/new-psychic-shield.hbs')
      }
    },
    newActVia: T('dialog/new-act-via.hbs'),
    newPsychicDiscipline: T('dialog/new-psychic-discipline.hbs'),
    newMentalPattern: T('dialog/new-mental-pattern.hbs'),
    Combat: {
      CombatAttackDialog: {
        main: T('dialog/combat/combat-attack/combat-attack-dialog.hbs'),
        parts: {
          combat: T('dialog/combat/combat-attack/parts/combat.hbs'),
          mystic: T('dialog/combat/combat-attack/parts/mystic.hbs'),
          psychic: T('dialog/combat/combat-attack/parts/psychic.hbs')
        }
      },
      CombatDefenseDialog: {
        main: T('dialog/combat/combat-defense/combat-defense-dialog.hbs'),
        parts: {
          combat: T('dialog/combat/combat-defense/parts/combat.hbs'),
          damageResistance: T('dialog/combat/combat-defense/parts/damage-resistance.hbs'),
          mystic: T('dialog/combat/combat-defense/parts/mystic.hbs'),
          psychic: T('dialog/combat/combat-defense/parts/psychic.hbs')
        }
      },
      CombatRequestDialog: T('dialog/combat/combat-request-dialog.hbs'),
      GMCombatDialog: T('dialog/combat/gm-combat-dialog.hbs'),
      DefenseConfigDialog: T('dialog/combat/defense-config-dialog.hbs'),
      AttackConfigDialog: T('dialog/combat/attack-config-dialog.hbs')
    },
    GenericDialog: T('dialog/generic-dialog/generic-dialog.hbs'),
    Icons: {
      Accept: T('dialog/parts/check-icon.hbs'),
      Cancel: T('dialog/parts/cancel-icon.hbs')
    },
    Config: {
      ModifyDiceFormulas: T('dialog/config/modify-dice-formulas.hbs')
    }
  },

  CustomHotBar: T('custom-hotbar/custom-hotbar.hbs'),

  Chat: {
    CombatResult: T('chat/combat-result.hbs'),
    AutoCombatResult: T('chat/auto-combat-result.hbs'),
    AttackData: T('chat/attack-data.hbs'),
    MultiDefenseResult: T('chat/multi-defense-result.hbs'),
    AttackTargetsChips: T('chat/attack-targets-chips.hbs')
  }
};
