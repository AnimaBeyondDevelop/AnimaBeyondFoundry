import { Templates } from '../../utils/constants';
import { calculateCombatResult } from '../../combat/utils/calculateCombatResult';
import { calculateCharacteristicImbalance } from '../../combat/utils/calculateCharacteristicImbalance';
import { calculateATReductionByQuality } from '../../combat/utils/calculateATReductionByQuality';
import { getGeneralLocation } from '../../combat/utils/getGeneralLocation';
import { mysticCast } from '../../utils/functions/mysticCast';
import { getResistanceRoll } from '../../utils/functions/getResistanceRoll';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll.js';

const getInitialData = (attacker, defender, options = {}) => {
  const attackerActor = attacker.actor;
  const defenderActor = defender.actor;

  return {
    ui: {
      isCounter: options.isCounter ?? false,
      resistanceRoll: false,
      characteristicRoll: false
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

    html.find('.apply-values').click(async () => {
      this.applyValuesIfBeAble();

      if (!this.modalData.calculations?.canCounter && this.canApplyDamage) {
        const { calculations } = this.modalData;
        const damage = calculations.isNonLethalDamage
          ? calculations.nonLethalDamage
          : calculations.damage;
        this.defenderActor.applyDamage(damage);
      }
      await this.criticIfBeAble();

      this.mysticCastEvaluateIfAble();
      this.newSupernaturalShieldIfBeAble();
      this.accumulateDefensesIfAble();
      this.executeMacro(true);
      this.close();
    });

    html.find('.roll-resistance').click(async () => {
      this.applyValuesIfBeAble();
      const { value, type } = this.modalData.attacker.result.values?.resistanceEffect;
      const resistanceRoll = await getResistanceRoll(
        value,
        type,
        this.modalData.attacker.token,
        this.modalData.defender.token
      );
      if (resistanceRoll.total < 0 && this.modalData.attacker.result.values.damage > 0) {
        this.defenderActor.applyDamage(this.modalData.attacker.result.values.damage);
        this.executeMacro(true, resistanceRoll.total - value);
      } else {
        this.executeMacro(false, resistanceRoll.total - value);
      }
      this.mysticCastEvaluateIfAble();
      this.accumulateDefensesIfAble();
      this.close();
    });

    html.find('.roll-characteristic').click(async () => {
      const { i18n } = game;
      const { specificAttack } = this.modalData.attacker.result.values;
      this.applyValuesIfBeAble();
      if (this.canApplyDamage) {
        const { calculations } = this.modalData;
        const damage = calculations.isNonLethalDamage
          ? calculations.nonLethalDamage
          : calculations.damage;
        this.defenderActor.applyDamage(damage);
      }
      const attackerCharacteristic = specificAttack.characteristic;
      const defenderCharacteristic =
        this.modalData.defender.result.values.specificAttack.characteristic;
      const { difference, atResValue } = this.modalData.calculations;
      const modAttacketChar =
        difference - atResValue < 100 ? -3 : difference - atResValue > 200 ? 3 : 0;
      const attacketModifier = calculateCharacteristicImbalance(
        attackerCharacteristic,
        defenderCharacteristic
      );
      const defenderModifier = calculateCharacteristicImbalance(
        defenderCharacteristic,
        attackerCharacteristic
      );
      let attackerFormula = `1d10ControlRoll + ${
        attackerCharacteristic + attacketModifier
      } + ${modAttacketChar}`;
      let defenderFormula = `1d10ControlRoll + ${
        defenderCharacteristic + defenderModifier
      }`;

      const attackerCharacteristicRoll = new ABFFoundryRoll(
        attackerFormula,
        this.attackerActor.system
      );
      attackerCharacteristicRoll.roll();
      const attackerFlavor = i18n.format(
        'macros.combat.dialog.physicalDefense.characteristic.title',
        {
          target: this.modalData.defender.token.name
        }
      );
      attackerCharacteristicRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
        flavor: attackerFlavor
      });

      const defenderCharacteristicRoll = new ABFFoundryRoll(
        defenderFormula,
        this.defenderActor.system
      );
      defenderCharacteristicRoll.roll();
      const defenderFlavor = i18n.format(
        'macros.combat.dialog.physicalDefense.characteristic.title',
        {
          target: this.modalData.attacker.token.name
        }
      );
      defenderCharacteristicRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ token: this.modalData.defender.token }),
        flavor: defenderFlavor
      });

      const data = {
        attacker: {
          name: this.attackerToken.name,
          img: this.attackerToken.texture.src,
          roll: attackerCharacteristicRoll.total
        },
        defender: {
          name: this.defenderToken.name,
          img: this.defenderToken.texture.src,
          roll: defenderCharacteristicRoll.total
        },
        result: Math.abs(
          attackerCharacteristicRoll.total - defenderCharacteristicRoll.total
        ),
        specificAttack: specificAttack.value,
        type: 'characteristic'
      };

      if (attackerCharacteristicRoll.total <= defenderCharacteristicRoll.total) {
        data.winner = this.defenderToken.name;
      } else {
        data.winner = this.attackerToken.name;
      }

      await renderTemplate(Templates.Chat.CheckResult, data).then(content => {
        ChatMessage.create({
          content
        });
      });

      this.mysticCastEvaluateIfAble();
      this.newSupernaturalShieldIfBeAble();
      this.accumulateDefensesIfAble();
      this.executeMacro(specificAttack.causeDamage);
      this.executeMacro(specificAttack.causeDamage, undefined, data);
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
      const { specificAttack } = this.modalData.attacker.result.values;

      const isNonLethalDamage =
        specificAttack.value == 'disable' || specificAttack.value == 'knockOut';

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
            defender.result.values?.supShield?.system.shieldPoints.value
          ) {
            this.modalData.calculations.canCounter = false;
          }
        } else {
          this.modalData.calculations = {
            difference: attackerTotal - defenderTotal,
            atResValue,
            canCounter: false,
            winner,
            damage: combatResult.damage,
            nonLethalDamage: combatResult.nonLethalDamage,
            isNonLethalDamage
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
          if (specificAttack.check) {
            this.modalData.ui.characteristicRoll = true;
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

  async criticIfBeAble() {
    if (this.canApplyDamage) {
      const { specificAttack } = this.modalData.attacker.result.values;
      const { lifePoints } = this.modalData.defender.result.values;
      const { calculations } = this.modalData;
      const hasCritic = specificAttack.weakspot
        ? calculations.damage >= lifePoints / 10
        : calculations.damage >= lifePoints / 2;
      if (!hasCritic) {
        return;
      }
      const attacker = this.modalData.attacker.token;
      const defender = this.modalData.defender.token;
      const targeted = specificAttack.targeted !== 'none';
      const generalLocation = getGeneralLocation();
      const location = targeted ? specificAttack.targeted : generalLocation.specific;
      let formula = `1d100CriticRoll + ${calculations.damage}`;
      const criticRoll = new ABFFoundryRoll(formula, attacker.actor.system);
      criticRoll.roll();
      const { i18n } = game;
      let flavor;
      if (generalLocation?.side == undefined || generalLocation?.side == 'none') {
        flavor = `${i18n.format(`macros.combat.dialog.hasCritic.title`, {
          target: defender.name
        })} ( ${i18n.format(`macros.combat.dialog.targetedAttack.${location}.title`)} )`;
      } else
        flavor = `${i18n.format(`macros.combat.dialog.hasCritic.title`, {
          target: defender.name
        })} ( ${i18n.format(
          `macros.combat.dialog.targetedAttack.${location}.title`
        )} ) ${i18n.format(
          `macros.combat.dialog.targetedAttack.side.${generalLocation.side}.title`
        )}`;
      criticRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ token: attacker }),
        flavor
      });
      const resistanceRoll = await getResistanceRoll(
        criticRoll.total,
        'physical',
        attacker,
        defender
      );
      const macroName = 'Critical Attack';
      const macro = game.macros.getName(macroName);
      if (macro) {
        macro.execute({ attacker, defender, resistanceRoll, location });
      } else {
        console.debug(`Macro '${macroName}' not found.`);
      }
      if (resistanceRoll < 0) {
        this.defenderActor.applyCriticEffect(Math.abs(resistanceRoll));
      }
    }
  }

  mysticCastEvaluateIfAble() {
    if (this.modalData.attacker.result?.type === 'mystic') {
      const { spellCasting, spellName, spellGrade } =
        this.modalData.attacker.result.values;
      mysticCast(this.attackerActor, spellCasting, spellName, spellGrade);
    }

    if (this.modalData.defender.result?.type === 'mystic') {
      const { spellCasting, spellName, spellGrade, supShield } =
        this.modalData.defender.result.values;
      if (supShield.create) {
        mysticCast(this.defenderActor, spellCasting, spellName, spellGrade);
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

  executeMacro(appliedDamage, resistanceRoll, specificAttackResult) {
    let macroName;
    const winner =
      this.modalData.calculations.winner == this.modalData.defender.token
        ? 'defender'
        : 'attacker';
    let args = {
      attacker: this.modalData.attacker.token,
      defender: this.modalData.defender.token,
      winner,
      defenseType: this.modalData.defender.result.values.type,
      totalAttack: this.modalData.attacker.result.values.total,
      appliedDamage,
      bloodColor: 'red', // agregar valor de color de sangre al actor
      missedAttack: false,
      isVisibleAttack: true,
      resistanceRoll,
      spellGrade: this.modalData.attacker.result.values.spellGrade,
      hasPsychicFatigue: false,
      specificAttackResult
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

    if (specificAttackResult !== undefined) {
      macroName = 'Specific Attack';
    }

    const macro = game.macros.getName(macroName);
    if (macro) {
      macro.execute(args);
    } else {
      console.debug(`Macro '${macroName}' not found.`);
    }
  }
}
