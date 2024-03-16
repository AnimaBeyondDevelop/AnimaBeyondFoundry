import { Templates } from '../../utils/constants';
import { calculateCombatResult } from '../../combat/utils/calculateCombatResult';
import { calculateCharacteristicImbalance } from '../../combat/utils/calculateCharacteristicImbalance';
import { calculateATReductionByQuality } from '../../combat/utils/calculateATReductionByQuality';
import { getGeneralLocation } from '../../combat/utils/getGeneralLocation';
import { ABFSettingsKeys } from '../../../utils/registerSettings';

const getInitialData = (attacker, defenders, options = {}) => {

  const defend = defenders.map(defender => {
    return {
      token: defender,
      actor: defender.actor,
      customModifier: 0,
      supernaturalShield: {
        dobleDamage: false,
        immuneToDamage: false
      },
      damageBarrier: false,
      roll: {
        oppousedCheckRoll: { request: false, sent: false, attacker: { value: 0, characteristic: undefined }, defender: { value: 0, characteristic: undefined } },
        resistanceRoll: { request: false, sent: false, check: 0, value: 0 },
        criticRoll: { request: false, sent: false, resist: 0, value: 0 },
      },
      isReady: false
    };
  })

  return {
    ui: {
      isCounter: options.isCounter ?? false,
      waitingRollRequest: false,
      targets: defenders.length,
      index: 1
    },
    attacker: {
      token: attacker,
      actor: attacker.actor,
      customModifier: 0,
      applyDamage: true,
      applyCritic: true,
      counterAttackBonus: options.counterAttackBonus,
      isReady: false
    },
    defender: defend[0],
    listDefenders: defend,
    combatMacroArgs: { attacker, defenders: [] }
  };
};

export class GMCombatDialog extends FormApplication {
  constructor(attacker, defenders, hooks, options = {}) {
    super(getInitialData(attacker, defenders, options));

    this.modalData = getInitialData(attacker, defenders, options);

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
    const { calculations, attacker } = this.modalData;

    if (!calculations) return false;
    if (calculations.canCounter) return false;

    const attackOverpassDefense = calculations.difference > 0;

    const hasDamage = calculations.damage !== undefined && calculations?.damage > 0;

    return this.isDamagingCombat && attackOverpassDefense && hasDamage && attacker.applyDamage;
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
      this.applyValuesIfBeAble(true);
      if (this.modalData.calculations?.canCounter) {
        this.hooks.onCounterAttack(this.modalData.calculations.counterAttackBonus, this.modalData.ui.index -1);
      }
    });

    html.find('.apply-values').click(async () => {
      const { ui } = this.modalData
      if (ui.index === ui.targets) {
        this.applyValuesIfBeAble(true);
        this.close();
      } else {
        await this.applyValuesIfBeAble();
        this.modalData.defender = this.modalData.listDefenders[ui.index];
        ui.index += 1;
        this.render();
      }
    });

    html.find('.roll-resistance').click(async () => {
      this.modalData.ui.waitingRollRequest = true;
      const { roll } = this.modalData.defender
      const { resistanceEffect: { type, value }, poison } = this.modalData.attacker.result.values;
      const check = roll.criticRoll.sent ? roll.criticRoll.value : poison?.check ? poison.effects.main.check : value;
      const resistance = roll.criticRoll.sent ? { main: 'physical', secondary: 'none' } : poison?.check ? { main: 'poison', secondary: 'none' } : { main: type, secondary: 'none' }
      this.hooks.onRollRequest(this.defenderToken, { type: 'resistance', resistance, check })
    });

    html.find('.roll-critic').click(async () => {
      this.modalData.ui.waitingRollRequest = true;
      const { specialPorpuseAttack } = this.modalData.attacker.result.values;
      const { damage } = this.modalData.calculations;
      const directed = specialPorpuseAttack.directed !== 'none';
      const generalLocation = getGeneralLocation();
      const location = directed ? specialPorpuseAttack.directed : generalLocation.specific;
      const critic = {
        damage,
        directed,
        generalLocation,
        location,
        criticLevel: this.attackerActor.system.general.modifiers.criticLevel.value,
        defender: this.defenderToken.name
      }
      this.hooks.onRollRequest(this.attackerToken, { type: 'critic', critic })
    });

    html.find('.roll-oppoused-check').click(async () => {
      this.modalData.ui.waitingRollRequest = true;
      const { specialCharacteristic, value } = this.modalData.attacker.result.values.specialPorpuseAttack;
      const { defender: { roll }, calculations: { difference, atResistance } } = this.modalData;
      const modifier = difference - atResistance < 100 ? -3 : difference - atResistance > 200 ? 3 : 0;

      const oppousedCheck = { specialPorpuseAttack: value }
      if (!roll.oppousedCheckRoll.attacker.characteristic) {
        if (specialCharacteristic) {
          oppousedCheck.characteristic = 'special'
          oppousedCheck.specialCharacteristic = specialCharacteristic
        }
        oppousedCheck.modifier = modifier
        oppousedCheck.attacker = true
        this.hooks.onRollRequest(this.attackerToken, { type: 'oppousedCheck', oppousedCheck })
      } else {
        this.hooks.onRollRequest(this.defenderToken, { type: 'oppousedCheck', oppousedCheck })
      }
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

  updateDefenderData(result, defenerId) {
    const defender = this.modalData.listDefenders.find(w => w.token._id === defenerId)

    result.values.initialTotal ||= result.values.total;
    result.values.total = Math.max(0, result.values.total);
    defender.result = result;
    defender.damageBarrier = this.defenderActor.system.general.modifiers.damageBarrier.value > 0

    if (result.type === 'mystic') {
      const { spells } = this.defenderActor.system.mystic;

      defender.result.spell = spells.find(w => w._id === result.values.spellUsed);
    }

    if (result.type === 'psychic') {
      const { psychicPowers } = this.defenderActor.system.psychic;

      defender.result.power = psychicPowers.find(w => w._id === result.values.powerUsed);
    }

    const { combat } = game
    if (combat?.getCombatantByToken(this.attackerToken._id)?.initiative -
      combat?.getCombatantByToken(this.defenderToken._id)?.initiative > 150) {
      defender.result.values.defenderCombatMod.surprised = { value: -90, apply: false }
    };

    this.render();
  }
  updateRollData(result) {
    const { attacker, defender, ui } = this.modalData;
    const { roll } = this.modalData.defender;
    const { type, values: { total, check, characteristic, fatigueUsed } } = result;
    ui.waitingRollRequest = false;

    if (result.token._id === defender.token._id) {
      if (type === 'resistance') {
        if (roll.criticRoll.sent) {
          roll.criticRoll.resist = total
          roll.resistanceRoll.sent = true;
        } else {
          roll.resistanceRoll.sent = true;
          roll.resistanceRoll.value = total;
          roll.resistanceRoll.check = check
        }
      }
      if (type === 'oppousedCheck') {
        roll.oppousedCheckRoll.sent = true;
        roll.oppousedCheckRoll.defender.value = total
        roll.oppousedCheckRoll.defender.characteristic = characteristic;

        const attackerImbalanceModifier = calculateCharacteristicImbalance(
          roll.oppousedCheckRoll.attacker.characteristic,
          roll.oppousedCheckRoll.defender.characteristic
        );
        const defenderImbalanceModifier = calculateCharacteristicImbalance(
          roll.oppousedCheckRoll.defender.characteristic,
          roll.oppousedCheckRoll.attacker.characteristic
        );

        roll.oppousedCheckRoll.attacker.value += attackerImbalanceModifier;
        roll.oppousedCheckRoll.defender.value += defenderImbalanceModifier;

        this.modalData.defender.result.values.fatigueUsed += fatigueUsed
      }
    }
    else if (result.token._id === attacker.token._id) {
      if (type === 'critic') {
        roll.criticRoll.sent = true;
        roll.criticRoll.value = total;
        roll.resistanceRoll.sent = false
      }
      if (type === 'oppousedCheck') {
        roll.oppousedCheckRoll.attacker.value = total
        roll.oppousedCheckRoll.attacker.characteristic = characteristic;

        this.modalData.attacker.result.values.fatigueUsed += fatigueUsed
      }
    }

    this.render();
  }

  getData() {
    const { attacker, defender } = this.modalData;
    const { roll } = this.modalData.defender;

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
      const { specialPorpuseAttack } = attacker.result.values;
      const { lifePoints } = defender.result.values;

      const isNonLethalDamage =
        specialPorpuseAttack.value === 'disable' || specialPorpuseAttack.value === 'knockOut';

      const { modifiers: { damageBarrier }, settings: { damageReduction } } = this.defenderActor.system.general;
      if (attacker.result.values.damageEnergy) { defender.damageBarrier = false };

      if (this.isDamagingCombat) {
        const combatResult = calculateCombatResult(
          attackerTotal,
          defenderTotal,
          Math.max(
            defender.result.values.at - calculateATReductionByQuality(attacker.result),
            0
          ),
          attacker.result.values.damage,
          defender.result.type === 'resistance' ? defender.result.values.surprised : false,
          defender.damageBarrier ? damageBarrier.value : 0,
          damageReduction.value
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

      if (this.canApplyDamage) {
        this.modalData.calculations.canCritic = specialPorpuseAttack.weakspot
          ? this.modalData.calculations.damage >= lifePoints / 10
          : this.modalData.calculations.damage >= lifePoints / 2;
        if (this.modalData.calculations.canCritic && attacker.applyCritic) {
          roll.criticRoll.request = true;
        } else { roll.criticRoll.request = false }
      } else {
        roll.criticRoll.request = false;
      }

      const minimumDamage10 = this.modalData.calculations.difference - atResistance >= 10;
      const { poison } = attacker.result?.values;
      if (winner === attacker.token) {
        if (minimumDamage10) {
          if (attacker.result.values?.resistanceEffect.check) {
            roll.resistanceRoll.request = true;
          }
          if (specialPorpuseAttack.check) {
            roll.oppousedCheckRoll.request = true;
          }
        } else { roll.oppousedCheckRoll.request = false }
      } else { roll.oppousedCheckRoll.request = false }

      if (winner === defender.token || !minimumDamage10) {
        roll.resistanceRoll.request = false;
      }

      if (poison) {
        if (poison.transmission === 'contact' && winner === attacker.token) {
          roll.resistanceRoll.request = true;
          poison.check = true
        } else if (poison.transmission === 'blood' && this.modalData.calculations.damage > 0) {
          roll.resistanceRoll.request = true;
          poison.check = true
        } else { roll.resistanceRoll.request = false; poison.check = true; }
      };

      if (roll.criticRoll.sent) {
        roll.resistanceRoll.request = true
      }

      for (const key in roll) {
        if (roll[key].sent) {
          roll[key].request = false
        }
      }
    }
    return this.modalData;
  }

  async _updateObject(event, formData) {
    this.modalData = mergeObject(this.modalData, formData);

    this.render();
  }
  async applyValuesIfBeAble(execute) {
    const firstDefender = this.modalData.ui.index === 1
    if (this.modalData.attacker.result?.type === 'combat' && firstDefender) {
      this.attackerActor.applyFatigue(this.modalData.attacker.result.values.fatigueUsed);
    }

    if (this.modalData.defender.result?.type === 'combat') {
      this.defenderActor.applyFatigue(this.modalData.defender.result.values.fatigueUsed);
    }
    this.mysticCastEvaluateIfAble(firstDefender);
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
    this.criticIfBeAble();

    this.executeCombatMacro(execute);
  }

  criticIfBeAble() {
    const { defender: { roll }, attacker } = this.modalData
    if (roll.criticRoll.sent && roll.resistanceRoll.sent && attacker.applyCritic) {
      const criticResist = roll.criticRoll.resist - roll.criticRoll.value
      if (criticResist < 0) {
        this.defenderActor.applyCriticEffect(Math.abs(criticResist));
      }
    }
  }

  mysticCastEvaluateIfAble(firstDefender) {
    if (this.modalData.attacker.result?.type === 'mystic' && firstDefender) {
      const { spellCasting, spellUsed, spellGrade } =
        this.modalData.attacker.result.values;
      this.attackerActor.mysticCast(spellCasting, spellUsed, spellGrade);
    }

    if (this.modalData.defender.result?.type === 'mystic') {
      const { spellCasting, spellUsed, spellGrade, supShield } =
        this.modalData.defender.result.values;
      if (supShield.create) {
        this.defenderActor.mysticCast(spellCasting, spellUsed, spellGrade);
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
        defender.result.values?.spellGrade,
        supShield.metamagics
      );
      return supShieldId;
    }
  }

  async applyDamageSupernaturalShieldIfBeAble(supShieldId) {
    const { attacker, defender } = this.modalData;
    const { dobleDamage, immuneToDamage } = defender.supernaturalShield;
    const {  modifiers: { damageBarrier }, settings: { damageReduction } } = this.defenderActor.system.general.modifiers;
    const { damageEnergy } = attacker.result.values
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
        newCombatResult.damageBarrier = damageEnergy ? 0 : damageBarrier.value;
        newCombatResult.damageReduction = damageReduction.value;
        newCombatResult.damageEnergy = damageEnergy
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

  executeCombatMacro(execute) {
    const missedAttackValue = game.settings.get(
      'animabf',
      ABFSettingsKeys.MACRO_MISS_ATTACK_VALUE
    );
    const macroAttackDefault = game.settings.get(
      'animabf',
      ABFSettingsKeys.MACRO_ATTACK_DEFAULT
    );
    const macroPorjectileDefault = game.settings.get(
      'animabf',
      ABFSettingsKeys.MACRO_PROJECTILE_DEFAULT
    );
    const macroPrefixAttack = game.settings.get(
      'animabf',
      ABFSettingsKeys.MACRO_PREFIX_ATTACK
    );

    const { attacker, defender, calculations } = this.modalData;
    const { roll } = this.modalData.defender;
    const winner =
      calculations.winner === this.defenderToken
        ? 'defender'
        : 'attacker';
    const specialPorpuseAttackResult = {
      specialPorpuseAttack: attacker.result.values?.specialPorpuseAttack.value,
      result: roll.oppousedCheckRoll.attacker.value - roll.oppousedCheckRoll.defender.value
    };
    let macroName;
    let defenderArgs = {
      defender: this.defenderToken,
      winner,
      defenseType: defender.result.values.type,
      totalAttack: attacker.result.values.total,
      appliedDamage: attacker.applyDamage ? calculations.damage : 0,
      damageType: attacker.result.values?.critic,
      bloodColor: 'red', // add bloodColor to actor template
      missedAttack: false,
      isVisibleAttack: true,
      resistanceRoll: roll.resistanceRoll.sent ? roll.resistanceRoll.value - roll.resistanceRoll.check : undefined,
      spellGrade: attacker.result.values.spellGrade,
      attackerPsychicFatigue: attacker.result.values?.psychicFatigue,
      defenderPsychicFatigue: defender.result.values?.psychicFatigue,
      specialPorpuseAttackResult,
      hasCritic: roll.criticRoll.sent && attacker.applyCritic,
      criticImpact: Math.max(roll.criticRoll.value - roll.criticRoll.resist, 0),
      poison: attacker.result.values.poison
    };
    if (defenderArgs.totalAttack < missedAttackValue && winner === 'defener') {
      defenderArgs.missedAttack = true;
    }

    if (attacker.result?.type === 'combat') {
      if (attacker.result.weapon) {
        const { name } = attacker.result.weapon;
        macroName = macroPrefixAttack + name;
      } else { macroName = macroPrefixAttack + 'Unarmed' }
      const { projectile } = attacker.result.values;
      if (projectile) {
        defenderArgs = { ...defenderArgs, projectile: projectile };
        if (projectile.type === 'shot') {
          macroName = macroPorjectileDefault;
        }
      }
    } else if (attacker.result?.type === 'mystic') {
      macroName = attacker.result.values.spellName;
    } else if (attacker.result?.type === 'psychic') {
      macroName = attacker.result.values.powerName;
    }

    if (
      attacker.result.values.visible !== undefined &&
      !attacker.result.values.visible
    ) {
      defenderArgs.isVisibleAttack = false;
    }

    if (
      attacker.result?.values.macro !== undefined &&
      attacker.result?.values.macro !== ''
    ) {
      macroName = attacker.result?.values.macro;
    }
    this.modalData.combatMacroArgs.defenders.push(defenderArgs)
    if (execute) {
      let macro = game.macros.getName(macroName) ?? game.macros.getName(macroAttackDefault);
      const args = this.modalData.combatMacroArgs
      if (macro) {
        console.debug(args);
        setTimeout(() => { macro.execute(args) }, 250);
      } else {
        console.debug(`Macro '${macroName}' not found.`);
      }
    }
  }
}
