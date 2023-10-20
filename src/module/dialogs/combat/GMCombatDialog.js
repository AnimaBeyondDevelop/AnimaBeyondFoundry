import { Templates } from '../../utils/constants';
import { calculateCombatResult } from '../../combat/utils/calculateCombatResult';
import { calculateATReductionByQuality } from '../../combat/utils/calculateATReductionByQuality';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll.js';

const getInitialData = (attacker, defender, options = {}) => {
  const attackerActor = attacker.actor;
  const defenderActor = defender.actor;

  return {
    ui: {
      isCounter: options.isCounter ?? false,
      resistanceRoll: false
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

export class GMCombatDialog extends FormApplication {
  constructor(attacker, defender, hooks, options = {}) {
    super(getInitialData(attacker, defender, options));

    this.modalData = getInitialData(attacker, defender, options);

    this.hooks = hooks;

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
    return this.modalData.attacker.token.actor;
  }

  get defenderActor() {
    return this.modalData.defender.token.actor;
  }

  get attackerToken() {
    return this.modalData.attacker.token;
  }

  get defenderToken() {
    return this.modalData.defender.token;
  }

  get isDamagingCombat() {
    const { attacker } = this.modalData;

    const isPhysicalDamagingCombat =
      attacker.result?.type === 'combat' && attacker.result.values.damage !== 0;

    const isMysticDamagingCombat =
      attacker.result?.type === 'mystic' && attacker.result.values.damage !== 0;

    const isPsychicDamagingCombat =
      attacker.result?.type === 'psychic' && attacker.result.values.damage !== 0;

    return isPhysicalDamagingCombat || isMysticDamagingCombat || isPsychicDamagingCombat;
  }

  get canApplyDamage() {
    const { calculations } = this.modalData;

    if (!calculations) return false;
    if (calculations.canCounter) return false;

    const attackOverpassDefense = calculations.difference > 0;

    const hasDamage = calculations.damage !== undefined && calculations?.damage > 0;

    return this.isDamagingCombat && attackOverpassDefense && hasDamage;
  }

  async close(options = { executeHook: true }) {
    if (options?.executeHook) {
      await this.hooks.onClose();
    }

    return super.close();
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.cancel-button').click(async () => {
      this.mysticCastEvaluateIfAble();
      await this.newSupernaturalShieldIfBeAble();
      this.applyDamageSupernaturalShieldIfBeAble();
      this.accumulateDefensesIfAble();
      this.executeMacro(false);
      this.close();
    });

    html.find('.make-counter').click(async () => {
      this.mysticCastEvaluateIfAble();
      await this.newSupernaturalShieldIfBeAble();
      this.applyDamageSupernaturalShieldIfBeAble();
      this.accumulateDefensesIfAble();
      this.applyValuesIfBeAble();
      this.executeMacro(false);

      if (this.modalData.calculations?.canCounter) {
        this.hooks.onCounterAttack(this.modalData.calculations.counterAttackBonus);
      }
    });

    html.find('.apply-values').click(() => {
      this.applyValuesIfBeAble();

      if (!this.modalData.calculations?.canCounter && this.canApplyDamage) {
        this.defenderActor.applyDamage(this.modalData.calculations.damage);
      }

      this.mysticCastEvaluateIfAble();
      this.newSupernaturalShieldIfBeAble();
      this.accumulateDefensesIfAble();
      this.executeMacro(true);
      this.close();
    });
    html.find('.roll-resistance').click(() => {
      this.applyValuesIfBeAble();
      const { value, type } = this.modalData.attacker.result.values?.resistanceEffect;
      const resistance =
        this.defenderActor.system.characteristics.secondaries.resistances[type].base
          .value;
      let formula = `1d100 + ${resistance ?? 0} - ${value ?? 0}`;
      const resistanceRoll = new ABFFoundryRoll(formula, this.defenderActor.system);
      resistanceRoll.roll();
      const { i18n } = game;
      const flavor = i18n.format('macros.combat.dialog.physicalDefense.resist.title', {
        target: this.modalData.attacker.token.name
      });
      resistanceRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
        flavor
      });
      if (resistanceRoll.total < 0 && this.modalData.attacker.result.values.damage > 0) {
        this.defenderActor.applyDamage(this.modalData.attacker.result.values.damage);
        this.executeMacro(true, resistanceRoll.total);
      } else {
        this.executeMacro(false, resistanceRoll.total);
      }
      this.mysticCastEvaluateIfAble();
      this.accumulateDefensesIfAble();
      this.close();
    });
    html.find('.show-results').click(async () => {
      const data = {
        attacker: {
          name: this.attackerToken.name,
          img: this.attackerToken.texture.src
        },
        defender: {
          name: this.defenderToken.name,
          img: this.defenderToken.texture.src
        },
        result: this.modalData.calculations?.difference,
        canCounter: this.modalData.calculations?.canCounter
      };

      if (this.modalData.calculations?.canCounter) {
        data.bonus = this.modalData.calculations.counterAttackBonus;
      } else {
        data.damage = this.modalData.calculations?.damage;
      }

      await renderTemplate(Templates.Chat.CombatResult, data).then(content => {
        ChatMessage.create({
          content
        });
      });
    });
  }

  updateAttackerData(result) {
    if (result.values.unableToAttack) {
      result.values.total = 0;
    }
    result.values.total = Math.max(0, result.values.total);
    this.modalData.attacker.result = result;

    if (result.type === 'combat') {
      const { weapons } = this.attackerActor.system.combat;

      this.modalData.attacker.result.weapon = weapons.find(
        w => w._id === result.values.weaponUsed
      );
    }

    if (result.type === 'mystic') {
      const { spells } = this.attackerActor.system.mystic;

      this.modalData.attacker.result.spell = spells.find(
        w => w._id === result.values.spellUsed
      );
    }

    if (result.type === 'psychic') {
      const powers = this.attackerActor.system.psychic.psychicPowers;

      this.modalData.attacker.result.power = powers.find(
        w => w._id === result.values.powerUsed
      );
    }

    this.render();
  }

  updateDefenderData(result) {
    if (result.values.unableToDefense) {
      result.values.total = 0;
    }
    result.values.total = Math.max(0, result.values.total);
    this.modalData.defender.result = result;

    if (result.type === 'mystic') {
      const { spells } = this.defenderActor.system.mystic;

      this.modalData.defender.result.spell = spells.find(
        w => w._id === result.values.spellUsed
      );
    }

    if (result.type === 'psychic') {
      const powers = this.defenderActor.system.psychic.psychicPowers;

      this.modalData.defender.result.power = powers.find(
        w => w._id === result.values.powerUsed
      );
    }

    this.render();
  }

  getData() {
    const { attacker, defender } = this.modalData;

    attacker.isReady = !!attacker.result;

    defender.isReady = !!defender.result;

    if (attacker.result && defender.result) {
      const attackerTotal =
        attacker.result.values.total + this.modalData.attacker.customModifier;
      const defenderTotal =
        defender.result.values.total + this.modalData.defender.customModifier;

      const winner = attackerTotal > defenderTotal ? attacker.token : defender.token;

      const { atResValue } = this.modalData.defender.result.values;

      if (this.isDamagingCombat) {
        const combatResult = calculateCombatResult(
          Math.max(attackerTotal, 0),
          Math.max(defenderTotal, 0),
          Math.max(
            defender.result.values.at - calculateATReductionByQuality(attacker.result),
            0
          ),
          attacker.result.values.damage,
          defender.result.type === 'resistance' ? defender.result.values.surprised : false
        );
        const { distance, projectile } = attacker.result.values;
        if (
          combatResult.canCounterAttack &&
          (!projectile.value ||
            distance.check ||
            (distance.enable && distance.value <= 1))
        ) {
          this.modalData.calculations = {
            difference: attackerTotal - defenderTotal,
            atResValue,
            canCounter: true,
            winner,
            counterAttackBonus: combatResult.counterAttackBonus
          };
          if (
            attacker.result.values.damage >
            defender.result.values?.supShield.system.shieldPoints.value
          ) {
            this.modalData.calculations.canCounter = false;
          }
        } else {
          this.modalData.calculations = {
            difference: attackerTotal - defenderTotal,
            atResValue,
            canCounter: false,
            winner,
            damage: combatResult.damage
          };
        }
      } else {
        this.modalData.calculations = {
          difference: attackerTotal - defenderTotal,
          atResValue,
          canCounter: false,
          winner
        };
      }

      if (winner === attacker.token) {
        const minimumDamage10 = this.modalData.calculations.difference - atResValue >= 10;
        if (minimumDamage10) {
          if (this.modalData.attacker.result.values?.resistanceEffect.check) {
            this.modalData.ui.resistanceRoll = true;
          }
        }
      }
    }

    return this.modalData;
  }

  async _updateObject(event, formData) {
    this.modalData = mergeObject(this.modalData, formData);

    this.render();
  }
  applyValuesIfBeAble() {
    if (this.modalData.attacker.result?.type === 'combat') {
      this.attackerActor.applyFatigue(this.modalData.attacker.result.values.fatigueUsed);
    }

    if (this.modalData.defender.result?.type === 'combat') {
      this.defenderActor.applyFatigue(this.modalData.defender.result.values.fatigue);
    }
  }

  mysticCastEvaluateIfAble() {
    if (this.modalData.attacker.result?.type === 'mystic') {
      const { spell, cast, override } =
        this.modalData.attacker.result.values?.spellCasting;
      if (!override.value) {
        if (spell.innate && cast.innate) {
        } else if (spell.prepared && cast.prepared) {
          this.attackerActor.deletePreparedSpell(
            this.modalData.attacker.result.values?.spellName,
            this.modalData.attacker.result.values?.spellGrade
          );
        } else {
          this.attackerActor.consumeAccumulatedZeon(
            this.modalData.attacker.result.values?.zeonCost
          );
        }
      }
    }

    if (this.modalData.defender.result?.type === 'mystic') {
      const { spell, cast, override } =
        this.modalData.defender.result.values?.spellCasting;
      if (!override.value) {
        if (spell.innate && cast.innate) {
        } else if (spell.prepared && cast.prepared) {
          this.defenderActor.deletePreparedSpell(
            this.modalData.defender.result.values?.spellName,
            this.modalData.defender.result.values?.spellGrade
          );
        } else {
          this.defenderActor.consumeAccumulatedZeon(
            this.modalData.defender.result.values?.zeonCost
          );
        }
      }
    }
  }

  accumulateDefensesIfAble() {
    if (this.modalData.defender.result?.type === 'combat') {
      this.defenderActor.accumulateDefenses(
        this.modalData.defender.result.values?.accumulateDefenses
      );
    }
  }

  async newSupernaturalShieldIfBeAble() {
    const { supShield } = this.modalData.defender.result?.values;
    if (
      (this.modalData.defender.result?.type === 'mystic' ||
        this.modalData.defender.result?.type === 'psychic') &&
      supShield.create
    ) {
      await this.defenderActor.newSupernaturalShield(
        supShield,
        this.modalData.defender.result.type
      );
    }
  }

  applyDamageSupernaturalShieldIfBeAble() {
    const cantDamage = this.modalData.defender.result?.values.cantDamage;
    const dobleDamage = this.modalData.defender.result?.values.dobleDamage;
    const defenderIsWinner =
      this.modalData.calculations.winner == this.modalData.defender.token;
    const damage = this.modalData.attacker.result?.values.damage;
    if (
      defenderIsWinner &&
      (this.modalData.defender.result?.type === 'mystic' ||
        this.modalData.defender.result?.type === 'psychic') &&
      !cantDamage
    ) {
      const { supShield } = this.modalData.defender.result?.values;
      const newCombatResult = {
        attack: 0,
        at: 0,
        halvedAbsorption: false
      };

      if (this.isDamagingCombat) {
        const { attacker, defender } = this.modalData;

        newCombatResult.attack = Math.max(
          attacker.result.values.total + this.modalData.attacker.customModifier,
          0
        );
        newCombatResult.at = Math.max(
          defender.result.values.at - calculateATReductionByQuality(attacker.result),
          0
        );
        newCombatResult.halvedAbsorption =
          defender.result.type === 'resistance'
            ? defender.result.values.surprised
            : false;
      }

      this.defenderActor.applyDamageSupernaturalShield(
        supShield,
        damage,
        dobleDamage,
        this.modalData.defender.result?.type,
        newCombatResult
      );
    }
  }

  executeMacro(appliedDamage, resistanceRoll) {
    let macroName;
    const winner =
      this.modalData.calculations.winner == this.modalData.defender.token
        ? 'defender'
        : 'attacker';
    let args = {
      attacker: this.attackerToken,
      defender: this.defenderToken,
      winner,
      defenseType: this.modalData.defender.result.values.type,
      totalAttack: this.modalData.attacker.result.values.total,
      appliedDamage,
      bloodColor: 'red', // agregar valor de color de sangre al actor
      missedAttack: false,
      isVisibleAttack: true,
      resistanceRoll,
      spellGrade: this.modalData.attacker.result.values.spellGrade,
      hasPsychicFatigue: false
    };

    if (args.totalAttack < 80) {
      args.missedAttack = true;
    } //cambiar valor fijo 80 por variable en ABFSettings

    if (this.modalData.attacker.result?.type === 'combat') {
      const { name } = this.modalData.attacker.result.weapon;
      macroName = `Atk ${name}`;
      const { projectile } = this.modalData.attacker.result.values;
      if (projectile) {
        args = { ...args, projectile: projectile };
        if (projectile.type == 'shot') {
          macroName = 'Atk Projectil Flecha';
        }
      }
    } else if (this.modalData.attacker.result?.type === 'mystic') {
      macroName = this.modalData.attacker.result.values.spellName;
    } else if (this.modalData.attacker.result?.type === 'psychic') {
      macroName = this.modalData.attacker.result.values.powerName;
      args.hasPsychicFatigue = this.modalData.attacker.result.values.fatigueCheck;
    }

    if (
      this.modalData.attacker.result.values.visible !== undefined &&
      !this.modalData.attacker.result.values.visible
    ) {
      args.isVisibleAttack = false;
    }

    if (
      this.modalData.attacker.result?.values.macro !== undefined &&
      this.modalData.attacker.result?.values.macro !== ''
    ) {
      macroName = this.modalData.attacker.result?.values.macro;
    }

    const macro = game.macros.getName(macroName);
    if (macro) {
      macro.execute(args);
    } else {
      console.debug(`Macro '${macroName}' not found.`);
    }
  }
}
