import { ABFSystemName } from '../../animabf.name';

export const Templates = {
  Dialog: {
    ModDialog: `systems/${ABFSystemName}/templates/dialog/mod-dialog.html`,
    DamageCalculator: `systems/${ABFSystemName}/templates/dialog/damage-calculator.hbs`,
    Combat: {
      CombatAttackDialog: {
        main: `systems/${ABFSystemName}/templates/dialog/combat/combat-attack/combat-attack-dialog.hbs`,
        parts: {
          combat: `systems/${ABFSystemName}/templates/dialog/combat/combat-attack/parts/combat.hbs`,
          mystic: `systems/${ABFSystemName}/templates/dialog/combat/combat-attack/parts/mystic.hbs`,
          psychic: `systems/${ABFSystemName}/templates/dialog/combat/combat-attack/parts/psychic.hbs`
        }
      },
      CombatDefenseDialog: {
        main: `systems/${ABFSystemName}/templates/dialog/combat/combat-defense/combat-defense-dialog.hbs`,
        parts: {
          combat: `systems/${ABFSystemName}/templates/dialog/combat/combat-defense/parts/combat.hbs`,
          damageResistance: `systems/${ABFSystemName}/templates/dialog/combat/combat-defense/parts/damage-resistance.hbs`,
          mystic: `systems/${ABFSystemName}/templates/dialog/combat/combat-defense/parts/mystic.hbs`,
          psychic: `systems/${ABFSystemName}/templates/dialog/combat/combat-defense/parts/psychic.hbs`
        }
      },
      CombatRequestDialog: `systems/${ABFSystemName}/templates/dialog/combat/combat-request-dialog.hbs`,
      GMCombatDialog: `systems/${ABFSystemName}/templates/dialog/combat/gm-combat-dialog.hbs`
    },
    GenericDialog: `systems/${ABFSystemName}/templates/dialog/generic-dialog/generic-dialog.hbs`,
    Icons: {
      Accept: `systems/${ABFSystemName}/templates/dialog/parts/check-icon.hbs`,
      Cancel: `systems/${ABFSystemName}/templates/dialog/parts/cancel-icon.hbs`
    }
  },
  CustomHotBar: `systems/${ABFSystemName}/templates/custom-hotbar/custom-hotbar.hbs`,
  Chat: {
    CombatResult: `systems/${ABFSystemName}/templates/chat/combat-result.hbs`
  }
};
