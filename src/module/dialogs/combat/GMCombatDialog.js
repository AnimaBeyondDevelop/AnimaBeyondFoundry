import { Templates } from '../../utils/constants';
import { calculateCombatResult } from '../../combat/utils/calculateCombatResult';
import { calculateCharacteristicImbalance } from '../../combat/utils/calculateCharacteristicImbalance';
import { calculateATReductionByQuality } from '../../combat/utils/calculateATReductionByQuality';
import { getGeneralLocation } from '../../combat/utils/getGeneralLocation';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { getResistanceRoll } from '../../utils/functions/getResistanceRoll';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll.js';

const getInitialData = (attacker, defender, options = {}) => {

  return {
    ui: {
      isCounter: options.isCounter ?? false,
      resistanceRoll: false,
      characteristicRoll: false
    },
    attacker: {
      token: attacker,
      actor: attacker.actor,
      customModifier: 0,
      counterAttackBonus: options.counterAttackBonus,
      isReady: false
    },
    defender: {
      token: defender,
      actor: defender.actor,
      customModifier: 0,
      supernaturalShield: {
        dobleDamage: false,
        immuneToDamage: false
      },
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
      this.close();
    });

    html.find('.make-counter').click(async () => {
      this.applyValuesIfBeAble();
      if (this.modalData.calculations?.canCounter) {
        this.hooks.onCounterAttack(this.modalData.calculations.counterAttackBonus);
      }
    });

    html.find('.apply-values').click(async () => {
      this.applyValuesIfBeAble();
      this.close();
    });


    html.find('.roll-resistance').click(async () => {
      const { value, type } = this.modalData.attacker.result.values?.resistanceEffect;
      const resistanceRoll = await getResistanceRoll(
        value,
        type,
        this.attackerToken,
        this.defenderToken
      );
      if (resistanceRoll.total < 0 && this.modalData.attacker.result.values.damage > 0) {
        this.applyValuesIfBeAble(resistanceRoll.total - value);
        this.close();
      }
    });

    html.find('.roll-characteristic').click(async () => {
      const { i18n } = game;
      const { specificAttack } = this.modalData.attacker.result.values;
      const attackerCharacteristic = specificAttack.characteristic;
      const defenderCharacteristic =
        this.modalData.defender.result.values.specificAttack.characteristic;
      const { difference, atResistance } = this.modalData.calculations;
      const modAttacketChar =
        difference - atResistance < 100 ? -3 : difference - atResistance > 200 ? 3 : 0;
      const attacketModifier = calculateCharacteristicImbalance(
        attackerCharacteristic,
        defenderCharacteristic
      );
      const defenderModifier = calculateCharacteristicImbalance(
        defenderCharacteristic,
        attackerCharacteristic
      );
      let attackerFormula = `1d10ControlRoll + ${attackerCharacteristic + attacketModifier
        } + ${modAttacketChar}`;
      let defenderFormula = `1d10ControlRoll + ${defenderCharacteristic + defenderModifier
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
        speaker: ChatMessage.getSpeaker({ token: this.attackerToken }),
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
          target: this.attackerToken.name
        }
      );
      defenderCharacteristicRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ token: this.defenderToken }),
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


      this.applyValuesIfBeAble(undefined, data);
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
    const { attacker } = this.modalData;
    result.values.initialTotal ||= result.values.total;
    result.values.total = Math.max(0, result.values.total);
    attacker.result = result;

    if (result.type === 'combat') {
      const { weapons } = this.attackerActor.system.combat;

      attacker.result.weapon = weapons.find(w => w._id === result.values.weaponUsed);
    }

    if (result.type === 'mystic') {
      const { spells } = this.attackerActor.system.mystic;

      attacker.result.spell = spells.find(w => w._id === result.values.spellUsed);
    }

    if (result.type === 'psychic') {
      const { psychicPowers } = this.attackerActor.system.psychic;

      attacker.result.power = psychicPowers.find(w => w._id === result.values.powerUsed);
    }

    this.render();
  }

  updateDefenderData(result) {
    const { defender } = this.modalData;
    result.values.initialTotal ||= result.values.total;
    result.values.total = Math.max(0, result.values.total);
    defender.result = result;

    if (result.type === 'mystic') {
      const { spells } = this.defenderActor.system.mystic;

      defender.result.spell = spells.find(w => w._id === result.values.spellUsed);
    }

    if (result.type === 'psychic') {
      const { psychicPowers } = this.defenderActor.system.psychic;

      defender.result.power = psychicPowers.find(w => w._id === result.values.powerUsed);
    }

    const { combat } = game
    if (combat.getCombatantByToken(this.attackerToken._id).initiative -
      combat.getCombatantByToken(this.defenderToken._id).initiative > 150) {
      defender.result.values.defenderCombatMod.surprised = { value: -90, apply: false }
    };

    this.render();
  }

  getData() {
    const { attacker, defender } = this.modalData;

    attacker.isReady = !!attacker.result;

    defender.isReady = !!defender.result;

    if (attacker.result && defender.result) {
      const { attackerCombatMod } = attacker.result.values;
      const { defenderCombatMod } = defender.result.values;

      let attackerModifier = 0;
      for (const key in attackerCombatMod) {
        if (attackerCombatMod[key]?.apply) {
          attackerModifier += attackerCombatMod[key]?.value ?? 0;
        }
      }
      attacker.result.values.total =
        attacker.result.values.initialTotal -
        attacker.result.values.modifier +
        attackerModifier;
      attacker.result.values.total = Math.max(0, attacker.result.values.total);

      let defenderModifier = 0;
      for (const key in defenderCombatMod) {
        if (defenderCombatMod[key]?.apply) {
          defenderModifier += defenderCombatMod[key]?.value ?? 0;
        }
      }
      defender.result.values.total =
        defender.result.values.initialTotal -
        defender.result.values.modifier +
        defenderModifier;
      defender.result.values.total = Math.max(0, defender.result.values.total);

      const attackerTotal = Math.max(0, attacker.result.values.total + attacker.customModifier);
      const defenderTotal = Math.max(0, defender.result.values.total + defender.customModifier);

      const winner = attackerTotal > defenderTotal ? attacker.token : defender.token;

      const atResistance = defender.result.values?.at * 10 + 20;
      const { specificAttack } = this.modalData.attacker.result.values;

      const isNonLethalDamage =
        specificAttack.value === 'disable' || specificAttack.value === 'knockOut';

      if (this.isDamagingCombat) {
        const combatResult = calculateCombatResult(
          attackerTotal,
          defenderTotal,
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
            atResistance,
            canCounter: true,
            winner,
            counterAttackBonus: combatResult.counterAttackBonus
          };
        } else {
          this.modalData.calculations = {
            difference: attackerTotal - defenderTotal,
            atResistance,
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
          atResistance,
          canCounter: false,
          winner
        };
      }

      const minimumDamage10 = this.modalData.calculations.difference - atResistance >= 10;
      if (winner === attacker.token) {
        if (minimumDamage10) {
          if (attacker.result.values?.resistanceEffect.check) {
            this.modalData.ui.resistanceRoll = true;
          }
          if (specificAttack.check) {
            this.modalData.ui.characteristicRoll = true;
          }
        }
      }
      if (winner === defender.token || !minimumDamage10) {
        this.modalData.ui.resistanceRoll = false;
      }
    }

    return this.modalData;
  }

  async _updateObject(event, formData) {
    this.modalData = mergeObject(this.modalData, formData);

    this.render();
  }
  async applyValuesIfBeAble(resistanceRoll, specificAttackResult) {
    if (this.modalData.attacker.result?.type === 'combat') {
      this.attackerActor.applyFatigue(this.modalData.attacker.result.values.fatigueUsed);
    }

    if (this.modalData.defender.result?.type === 'combat') {
      this.defenderActor.applyFatigue(this.modalData.defender.result.values.fatigueUsed);
    }
    this.mysticCastEvaluateIfAble();
    this.accumulateDefensesIfAble();
    const supShieldId = await this.newSupernaturalShieldIfBeAble();

    if (this.canApplyDamage) {
      const { calculations } = this.modalData;
      const damage = calculations.isNonLethalDamage
        ? calculations.nonLethalDamage
        : calculations.damage;
      this.defenderActor.applyDamage(damage);
    } else {
      this.applyDamageSupernaturalShieldIfBeAble(supShieldId);
    }
    await this.criticIfBeAble();

    this.executeCombatMacro(resistanceRoll, specificAttackResult);
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
      const targeted = specificAttack.targeted !== 'none';
      const generalLocation = getGeneralLocation();
      const location = targeted ? specificAttack.targeted : generalLocation.specific;
      let formula = `1d100CriticRoll + ${calculations.damage}`;
      const criticRoll = new ABFFoundryRoll(formula, this.attackerActor.system);
      criticRoll.roll();
      const { i18n } = game;
      let flavor;
      if (targeted || generalLocation?.side === undefined || generalLocation?.side === 'none') {
        flavor = `${i18n.format(`macros.combat.dialog.hasCritic.title`, {
          target: this.defenderToken.name
        })} ( ${i18n.format(`macros.combat.dialog.targetedAttack.${location}.title`)} )`;
      } else
        flavor = `${i18n.format(`macros.combat.dialog.hasCritic.title`, {
          target: this.defenderToken.name
        })} ( ${i18n.format(
          `macros.combat.dialog.targetedAttack.${location}.title`
        )} ) ${i18n.format(
          `macros.combat.dialog.targetedAttack.side.${generalLocation.side}.title`
        )}`;
      criticRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ token: this.attackerToken }),
        flavor
      });
      const resistanceRoll = await getResistanceRoll(
        criticRoll.total,
        'physical',
        this.attackerToken,
        this.defenderToken
      );
      const macroName = 'Critical Attack';
      const macro = game.macros.getName(macroName);
      if (macro) {
        macro.execute({ attacker: this.attackerToken, defender: this.defenderToken, resistanceRoll, location });
      } else {
        console.debug(`Macro '${macroName}' not found.`);
      }
      if (resistanceRoll < 0) {
        await this.defenderActor.withstandPain()
        this.defenderActor.applyCriticEffect(Math.abs(resistanceRoll));
      }
    }
  }

  mysticCastEvaluateIfAble() {
    if (this.modalData.attacker.result?.type === 'mystic') {
      const { spellCasting, spellName, spellGrade } =
        this.modalData.attacker.result.values;
      this.attackerActor.mysticCast(spellCasting, spellName, spellGrade);
    }

    if (this.modalData.defender.result?.type === 'mystic') {
      const { spellCasting, spellName, spellGrade, supShield } =
        this.modalData.defender.result.values;
      if (supShield.create) {
        this.defenderActor.mysticCast(spellCasting, spellName, spellGrade);
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
    const { defender } = this.modalData
    const { supShield } = defender.result?.values;
    if (
      (defender.result?.type === 'mystic' ||
        defender.result?.type === 'psychic') &&
      supShield.create
    ) {
      const supShieldId = await this.defenderActor.newSupernaturalShield(
        defender.result.type,
        defender.result?.power ?? {},
        defender.result.values?.psychicPotential ?? 0,
        defender.result?.spell ?? {},
        defender.result.values?.spellGrade
      );
      return supShieldId;
    }
  }

  applyDamageSupernaturalShieldIfBeAble(supShieldId) {
    const { attacker, defender } = this.modalData;
    const { dobleDamage, immuneToDamage } = defender.supernaturalShield;
    const defenderIsWinner =
      this.modalData.calculations.winner === this.defenderToken;
    const damage = this.modalData.attacker.result?.values.damage;
    if (
      defenderIsWinner &&
      (defender.result?.type === 'mystic' ||
        defender.result?.type === 'psychic') &&
      !immuneToDamage
    ) {
      const { supShield } = defender.result?.values;
      const newCombatResult = {
        attack: 0,
        at: 0,
        halvedAbsorption: false
      };

      if (this.isDamagingCombat) {

        newCombatResult.attack = Math.max(
          attacker.result.values.total + attacker.customModifier,
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

      if (supShieldId) {
        supShield.id = supShieldId;
      }

      this.defenderActor.applyDamageSupernaturalShield(
        supShield.id,
        damage,
        dobleDamage,
        newCombatResult
      );
    }
  }

  executeCombatMacro(resistanceRoll, specificAttackResult) {
    let macroName;
    const winner =
      this.modalData.calculations.winner === this.defenderToken
        ? 'defender'
        : 'attacker';
    const missedAttackValue = game.settings.get(
      'animabf',
      ABFSettingsKeys.MACRO_MISS_ATTACK_VALUE
    );
    const macroPorjectileDefault = game.settings.get(
      'animabf',
      ABFSettingsKeys.MACRO_PROJECTILE_DEFAULT
    );
    const macroPrefixAttack = game.settings.get(
      'animabf',
      ABFSettingsKeys.MACRO_PREFIX_ATTACK
    );
    let args = {
      attacker: this.attackerToken,
      defender: this.defenderToken,
      winner,
      defenseType: this.modalData.defender.result.values.type,
      totalAttack: this.modalData.attacker.result.values.total,
      appliedDamage: this.canApplyDamage,
      bloodColor: 'red', // add bloodColor to actor template
      missedAttack: false,
      isVisibleAttack: true,
      resistanceRoll,
      spellGrade: this.modalData.attacker.result.values.spellGrade,
      attackerPsychicFatigue: this.modalData.attacker.result.values?.psychicFatigue,
      defenderPsychicFatigue: this.modalData.defender.result.values?.psychicFatigue,
      specificAttackResult
    };
    if (args.totalAttack < missedAttackValue) {
      args.missedAttack = true;
    }

    if (this.modalData.attacker.result?.type === 'combat') {
      const { name } = this.modalData.attacker.result.weapon;
      macroName = macroPrefixAttack + name;
      const { projectile } = this.modalData.attacker.result.values;
      if (projectile) {
        args = { ...args, projectile: projectile };
        if (projectile.type === 'shot') {
          macroName = macroPorjectileDefault;
        }
      }
    } else if (this.modalData.attacker.result?.type === 'mystic') {
      macroName = this.modalData.attacker.result.values.spellName;
    } else if (this.modalData.attacker.result?.type === 'psychic') {
      macroName = this.modalData.attacker.result.values.powerName;
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
    }//quitar esta parte, hacer que el macro lea el resultado y apunte a este otro macro

    const macro = game.macros.getName(macroName);
    if (macro) {
      macro.execute(args);
    } else {
      console.debug(`Macro '${macroName}' not found.`);
    }
  }
}
