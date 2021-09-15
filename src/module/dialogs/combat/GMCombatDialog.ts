import { ABFActor } from '../../actor/ABFActor';
import { calculateCombatResult } from '../../macros/functions/damageCalculatorMacro';
import { UserCombatAttackResult } from './CombatAttackDialog';
import { UserCombatDefenseResult } from './CombatDefenseDialog';
import { WeaponDataSource } from '../../types/combat/WeaponItemConfig';
import { PsychicPowerDataSource } from '../../types/psychic/PsychicPowerItemConfig';
import { SpellDataSource } from '../../types/mystic/SpellItemConfig';
import { Log } from '../../../utils/Log';
import { Templates } from '../../utils/constants';
import CloseOptions = FormApplication.CloseOptions;

type GMCombatDialogData = {
  ui: {
    isCounter: boolean;
  };
  attacker: {
    actor: ABFActor;
    isReady: boolean;
    customModifier: number;
    counterAttackBonus?: number;
    result?: UserCombatAttackResult & {
      weapon?: WeaponDataSource;
      spell?: SpellDataSource;
      power?: PsychicPowerDataSource;
    };
  };
  defender: {
    actor: ABFActor;
    isReady: boolean;
    customModifier: number;
    result?: UserCombatDefenseResult & {
      spell?: SpellDataSource;
      power?: PsychicPowerDataSource;
    };
  };
  calculations?:
    | {
        winner: ABFActor;
        canCounter: false;
        difference: number;
        damage?: number;
      }
    | {
        winner: ABFActor;
        canCounter: true;
        difference: number;
        counterAttackBonus: number;
      };
};

const getInitialData = (
  attacker: ABFActor,
  defender: ABFActor,
  options: { isCounter?: boolean; counterAttackBonus?: number } = {}
): GMCombatDialogData => ({
  ui: {
    isCounter: options.isCounter ?? false
  },
  attacker: {
    actor: attacker,
    customModifier: 0,
    counterAttackBonus: options.counterAttackBonus,
    isReady: false
  },
  defender: {
    actor: defender,
    customModifier: 0,
    isReady: false
  }
});

export class GMCombatDialog extends FormApplication<FormApplication.Options, GMCombatDialogData> {
  private data: GMCombatDialogData;

  constructor(
    attacker: ABFActor,
    defender: ABFActor,
    private hooks: {
      onClose: () => Promise<void> | void;
      onCounterAttack: (bonus: number) => Promise<void> | void;
    },
    options: { isCounter?: boolean; counterAttackBonus?: number } = {}
  ) {
    super(getInitialData(attacker, defender, options));

    this.data = getInitialData(attacker, defender, options);

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['abf-dialog gm-combat-dialog'],
      submitOnChange: true,
      closeOnSubmit: false,
      height: 600,
      width: 700,
      template: 'systems/animabf/templates/dialog/combat/gm-combat-dialog.hbs',
      title: 'GM Combat'
    });
  }

  get attacker() {
    return this.data.attacker.actor;
  }

  get defender() {
    return this.data.defender.actor;
  }

  async close(options: CloseOptions & { executeHook: boolean } = { executeHook: true }): Promise<void> {
    if (options?.executeHook) {
      await this.hooks.onClose();
    }

    return super.close();
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.cancel-button').click(() => {
      this.close();
    });

    html.find('.make-counter').click(() => {
      this.applyValuesIfBeAble();

      if (this.data.calculations?.canCounter) {
        this.hooks.onCounterAttack(this.data.calculations.counterAttackBonus);
      }
    });

    html.find('.apply-values').click(() => {
      this.applyValuesIfBeAble();

      if (!this.data.calculations?.canCounter && this.canApplyDamage) {
        this.defender.applyDamage(this.data.calculations!.damage!);
      }

      this.close();
    });

    html.find('.show-results').click(async () => {
      this.applyValuesIfBeAble();

      const data: Record<string, any> = {
        attacker: this.attacker,
        defender: this.defender,
        result: this.data.calculations?.difference,
        canCounter: this.data.calculations?.canCounter
      };

      if (this.data.calculations?.canCounter) {
        data.bonus = this.data.calculations.counterAttackBonus;
      } else {
        data.damage = this.data.calculations?.damage;
      }

      await renderTemplate(Templates.Chat.CombatResult, data).then(content => {
        ChatMessage.create({
          content
        });
      });
    });
  }
  get canApplyDamage() {
    return (
      this.data.attacker.result?.type === 'combat' &&
      this.data.defender.result?.type === 'combat' &&
      this.data.calculations &&
      this.data.calculations.difference > 0 &&
      !this.data.calculations.canCounter &&
      this.data.calculations.damage !== undefined &&
      this.data.calculations?.damage > 0
    );
  }

  private applyValuesIfBeAble() {
    if (this.data.attacker.result?.type === 'combat') {
      this.attacker.applyFatigue(this.data.attacker.result.values.fatigueUsed);
    }

    if (this.data.defender.result?.type === 'combat') {
      this.defender.applyFatigue(this.data.defender.result.values.fatigue);
    }
  }

  updateAttackerData(result: UserCombatAttackResult) {
    this.data.attacker.result = result;

    if (result.type === 'combat') {
      const weapons = this.attacker.data.data.combat.weapons as WeaponDataSource[];

      this.data.attacker.result.weapon = weapons.find(w => w._id === result.values.weaponUsed)!;
    }

    if (result.type === 'mystic') {
      const spells = this.attacker.data.data.mystic.spells as SpellDataSource[];

      Log.log(spells, result.values.spellUsed);
      this.data.attacker.result.spell = spells.find(w => w._id === result.values.spellUsed)!;
    }

    if (result.type === 'psychic') {
      const powers = this.attacker.data.data.psychic.psychicPowers as PsychicPowerDataSource[];

      this.data.attacker.result.power = powers.find(w => w._id === result.values.powerUsed)!;
    }

    this.render();
  }

  updateDefenderData(result: UserCombatDefenseResult) {
    this.data.defender.result = result;

    if (result.type === 'mystic') {
      const spells = this.defender.data.data.mystic.spells as SpellDataSource[];

      this.data.defender.result.spell = spells.find(w => w._id === result.values.spellUsed)!;
    }

    if (result.type === 'psychic') {
      const powers = this.defender.data.data.psychic.psychicPowers as PsychicPowerDataSource[];

      this.data.defender.result.power = powers.find(w => w._id === result.values.powerUsed)!;
    }

    this.render();
  }

  getData(): Promise<GMCombatDialogData> | GMCombatDialogData {
    const { attacker, defender } = this.data;

    attacker.isReady = !!attacker.result;

    defender.isReady = !!defender.result;

    if (attacker.result && defender.result) {
      const attackerTotal = attacker.result.values.total + this.data.attacker.customModifier;
      const defenderTotal = defender.result.values.total + this.data.defender.customModifier;

      const winner = attackerTotal > defenderTotal ? attacker.actor : defender.actor;

      if (attacker.result.type === 'combat' && defender.result.type === 'combat') {
        const combatResult = calculateCombatResult(
          attackerTotal,
          defenderTotal,
          defender.result.values.at!,
          attacker.result.values.damage
        );

        if (combatResult.canCounterAttack) {
          this.data.calculations = {
            difference: attackerTotal - defenderTotal,
            canCounter: true,
            winner,
            counterAttackBonus: combatResult.counterAttackBonus
          };
        } else {
          this.data.calculations = {
            difference: attackerTotal - defenderTotal,
            canCounter: false,
            winner,
            damage: combatResult.damage
          };
        }
      } else {
        this.data.calculations = {
          difference: attackerTotal - defenderTotal,
          canCounter: false,
          winner
        };
      }
    }

    return this.data;
  }

  async _updateObject(event, formData) {
    this.data = mergeObject(this.data, formData);

    this.render();
  }
}
