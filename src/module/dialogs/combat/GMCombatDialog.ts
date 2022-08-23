import { UserCombatAttackResult } from './CombatAttackDialog';
import { UserCombatDefenseResult } from './CombatDefenseDialog';
import { NoneWeaponCritic, WeaponDataSource } from '../../types/combat/WeaponItemConfig';
import { PsychicPowerDataSource } from '../../types/psychic/PsychicPowerItemConfig';
import { SpellDataSource } from '../../types/mystic/SpellItemConfig';
import { Templates } from '../../utils/constants';
import { ABFActor } from '../../actor/ABFActor';
import { calculateCombatResult } from '../../combat/utils/calculateCombatResult';
import { calculateATReductionByQuality } from '../../combat/utils/calculateATReductionByQuality';
import CloseOptions = FormApplication.CloseOptions;

export type GMCombatAttackResult = UserCombatAttackResult & {
  weapon?: WeaponDataSource;
  spell?: SpellDataSource;
  power?: PsychicPowerDataSource;
};

type GMCombatDialogData = {
  ui: {
    isCounter: boolean;
  };
  attacker: {
    actor: ABFActor;
    token: TokenDocument;
    isReady: boolean;
    customModifier: number;
    counterAttackBonus?: number;
    result?: GMCombatAttackResult;
  };
  defender: {
    actor: ABFActor;
    token: TokenDocument;
    isReady: boolean;
    customModifier: number;
    result?: UserCombatDefenseResult & {
      spell?: SpellDataSource;
      power?: PsychicPowerDataSource;
    };
  };
  calculations?:
    | {
        winner: TokenDocument;
        canCounter: false;
        difference: number;
        damage?: number;
      }
    | {
        winner: TokenDocument;
        canCounter: true;
        difference: number;
        counterAttackBonus: number;
      };
};

const getInitialData = (
  attacker: TokenDocument,
  defender: TokenDocument,
  options: { isCounter?: boolean; counterAttackBonus?: number } = {}
): GMCombatDialogData => {
  const attackerActor = attacker.actor!;
  const defenderActor = defender.actor!;

  return {
    ui: {
      isCounter: options.isCounter ?? false
    },
    attacker: {
      token: attacker,
      actor: attackerActor,
      customModifier: 0,
      counterAttackBonus: options.counterAttackBonus,
      isReady: false
    },
    defender: {
      token: defender,
      actor: defenderActor,
      customModifier: 0,
      isReady: false
    }
  };
};

export class GMCombatDialog extends FormApplication<FormApplicationOptions, GMCombatDialogData> {
  private data: GMCombatDialogData;

  constructor(
    attacker: TokenDocument,
    defender: TokenDocument,
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

  get attackerActor() {
    return this.data.attacker.token.actor!;
  }

  get defenderActor() {
    return this.data.defender.token.actor!;
  }

  get attackerToken() {
    return this.data.attacker.token;
  }

  get defenderToken() {
    return this.data.defender.token;
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
        this.defenderActor.applyDamage(this.data.calculations!.damage!);
      }

      this.close();
    });

    html.find('.show-results').click(async () => {
      const data: Record<string, any> = {
        attacker: {
          name: this.attackerToken.name,
          img: this.attackerToken.data.img
        },
        defender: {
          name: this.defenderToken.name,
          img: this.defenderToken.data.img
        },
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

  get isDamagingCombat(): boolean {
    const { attacker } = this.data;

    const isPhysicalDamagingCombat = attacker.result?.type === 'combat';

    const isMysticDamagingCombat =
      attacker.result?.type === 'mystic' && attacker.result.values.critic !== NoneWeaponCritic.NONE;

    const isPsychicDamagingCombat =
      attacker.result?.type === 'psychic' && attacker.result.values.critic !== NoneWeaponCritic.NONE;

    return (isPhysicalDamagingCombat || isMysticDamagingCombat || isPsychicDamagingCombat);
  }

  get canApplyDamage(): boolean {
    const { calculations } = this.data;

    if (!calculations) return false;
    if (calculations.canCounter) return false;

    const attackOverpassDefense = calculations.difference > 0;

    const hasDamage = calculations.damage !== undefined && calculations?.damage > 0;

    return this.isDamagingCombat && attackOverpassDefense && hasDamage;
  }

  private applyValuesIfBeAble() {
    if (this.data.attacker.result?.type === 'combat') {
      this.attackerActor.applyFatigue(this.data.attacker.result.values.fatigueUsed);
    }

    if (this.data.defender.result?.type === 'combat') {
      this.defenderActor.applyFatigue(this.data.defender.result.values.fatigue);
    }
  }

  updateAttackerData(result: UserCombatAttackResult) {
    this.data.attacker.result = result;

    if (result.type === 'combat') {
      const weapons = this.attackerActor.data.data.combat.weapons as WeaponDataSource[];

      this.data.attacker.result.weapon = weapons.find(w => w._id === result.values.weaponUsed)!;
    }

    if (result.type === 'mystic') {
      const spells = this.attackerActor.data.data.mystic.spells as SpellDataSource[];

      this.data.attacker.result.spell = spells.find(w => w._id === result.values.spellUsed)!;
    }

    if (result.type === 'psychic') {
      const powers = this.attackerActor.data.data.psychic.psychicPowers as PsychicPowerDataSource[];

      this.data.attacker.result.power = powers.find(w => w._id === result.values.powerUsed)!;
    }

    this.render();
  }

  updateDefenderData(result: UserCombatDefenseResult) {
    result.values.total = Math.max(0, result.values.total);
    this.data.defender.result = result;

    if (result.type === 'mystic') {
      const spells = this.defenderActor.data.data.mystic.spells as SpellDataSource[];

      this.data.defender.result.spell = spells.find(w => w._id === result.values.spellUsed)!;
    }

    if (result.type === 'psychic') {
      const powers = this.defenderActor.data.data.psychic.psychicPowers as PsychicPowerDataSource[];

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

      const winner = attackerTotal > defenderTotal ? attacker.token : defender.token;

      if (this.isDamagingCombat) {
        const combatResult = calculateCombatResult(
          Math.max(attackerTotal, 0),
          Math.max(defenderTotal, 0),
          Math.max(defender.result.values.at! - calculateATReductionByQuality(attacker.result), 0),
          attacker.result.values.damage,
          (defender.result.type === 'resistance') ? defender.result.values.surprised : false
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
