import { Templates } from '../../utils/constants';
import { calculateCombatResult } from '../../combat/utils/calculateCombatResult';
import { calculateATReductionByQuality } from '../../combat/utils/calculateATReductionByQuality';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { executeMacro } from '../../utils/functions/executeMacro';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll.js';

const getInitialData = (attacker, defender, options = {}) => {
  const attackerActor = attacker.actor;
  const defenderActor = defender.actor;

  return {
    ui: {
      isCounter: options.isCounter ?? false,
      waitingRollRequest: false
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
      supernaturalShield: {
        dobleDamage: false,
        immuneToDamage: false
      },
      isReady: false
    },
    roll: {
      characteristicRoll: {
        request: false,
        sent: false,
        attackerValue: 0,
        defenderValue: 0
      },
      resistanceRoll: { request: false, sent: false, check: 0, value: 0 },
      withstandPainRoll: { request: false, sent: false, check: 0, value: 0 },
      criticRoll: { request: false, sent: false, check: 0, value: 0 }
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
      this.modalData.ui.waitingRollRequest = true;
      const { type, value } = this.modalData.attacker.result.values?.resistanceEffect;
      this.hooks.onRollRequest(this.defenderToken, {
        resistance: { main: type, secondary: 'none' },
        check: value
      });
    });

    html.find('.roll-characteristic').click(async () => {
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
      }

      await renderTemplate(Templates.Chat.CheckResult, data).then(content => {
        ChatMessage.create({
          content
        });
      });

      this.applyValuesIfBeAble();
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

    this.render();
  }
  updateRollData(result) {
    const { attacker, defender, ui, roll } = this.modalData;
    const { type, total, check } = result.values;
    ui.waitingRollRequest = false;

    if (result.token._id === defender.token._id) {
      if (type === 'resistance') {
        roll.resistanceRoll.sent = true;
        roll.resistanceRoll.value = total;
        roll.resistanceRoll.check = check;
      }
      if (type === 'withstandPain') {
        roll.withstandPainRoll.sent = true;
        roll.withstandPainRoll.value = total;
        roll.withstandPainRoll.check = check;
      }
    } else if (result.token._id === attacker.token._id) {
      if (type === 'critic') {
        roll.criticRoll.sent = true;
        roll.criticRoll.value = total;
        roll.criticRoll.check = check;
      }
    }

    this.render();
  }

  getData() {
    console.log(this.modalData);
    const { attacker, defender, roll } = this.modalData;

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

      const attackerTotal = Math.max(
        0,
        attacker.result.values.total + attacker.customModifier
      );
      const defenderTotal = Math.max(
        0,
        defender.result.values.total + defender.customModifier
      );

      const winner = attackerTotal > defenderTotal ? attacker.token : defender.token;

      const atResistance = defender.result.values?.at * 10 + 20;

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
            damage: combatResult.damage
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
            roll.resistanceRoll.request = true;
          }
        }
      }
      if (winner === defender.token || !minimumDamage10) {
        roll.resistanceRoll.request = false;
      }
      for (const key in roll) {
        if (roll[key].sent) {
          roll[key].request = false;
        }
      }
    }

    return this.modalData;
  }

  async _updateObject(event, formData) {
    this.modalData = mergeObject(this.modalData, formData);

    this.render();
  }
  async applyValuesIfBeAble() {
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
      this.defenderActor.applyDamage(this.modalData.calculations.damage);
    } else {
      this.applyDamageSupernaturalShieldIfBeAble(supShieldId);
    }

    this.executeCombatMacro();
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
    const { supShield } = this.modalData.defender.result?.values;
    if (
      (this.modalData.defender.result?.type === 'mystic' ||
        this.modalData.defender.result?.type === 'psychic') &&
      supShield.create
    ) {
      const supShieldId = await this.defenderActor.newSupernaturalShield(
        this.modalData.defender.result.type,
        this.modalData.defender.result?.power ?? {},
        this.modalData.defender.result.values?.psychicPotential ?? 0,
        this.modalData.defender.result.spell ?? {},
        this.modalData.defender.result.values?.spellGrade
      );
      return supShieldId;
    }
  }

  applyDamageSupernaturalShieldIfBeAble(supShieldId) {
    const { dobleDamage, immuneToDamage } = this.modalData.defender.supernaturalShield;
    const defenderIsWinner =
      this.modalData.calculations.winner == this.modalData.defender.token;
    const damage = this.modalData.attacker.result?.values.damage;
    if (
      defenderIsWinner &&
      (this.modalData.defender.result?.type === 'mystic' ||
        this.modalData.defender.result?.type === 'psychic') &&
      !immuneToDamage
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

  executeCombatMacro() {
    const missedAttackValue = game.settings.get(
      'animabf',
      ABFSettingsKeys.MACRO_MISS_ATTACK_VALUE
    );
    const macroPrefixAttack = game.settings.get(
      'animabf',
      ABFSettingsKeys.MACRO_PREFIX_ATTACK
    );
    const winner =
      this.modalData.calculations.winner === this.defenderToken ? 'defender' : 'attacker';
    const { attacker, defender, roll } = this.modalData;
    const resistanceValue = attacker.result.values?.resistanceEffect.value;
    let macroName;
    let args = {
      attacker: this.attackerToken,
      defender: this.defenderToken,
      winner,
      defenseType: defender.result.values.type,
      totalAttack: attacker.result.values.total,
      appliedDamage: this.canApplyDamage,
      bloodColor: 'red', // add bloodColor to actor template
      missedAttack: false,
      isVisibleAttack: true,
      resistanceRoll: roll.resistanceRoll.sent
        ? roll.resistanceRoll.value - resistanceValue
        : undefined,
      spellGrade: attacker.result.values.spellGrade,
      attackerPsychicFatigue: attacker.result.values?.psychicFatigue,
      defenderPsychicFatigue: defender.result.values?.psychicFatigue
    };
    if (args.defenders[0].totalAttack < missedAttackValue && winner === 'defener') {
      args.defenders[0].missedAttack = true;
    }

    if (attacker.result?.type === 'combat') {
      if (!attacker.result.weapon) {
        attacker.result.weapon = { name: 'Unarmed' };
      }
      const { name } = attacker.result.weapon;
      macroName = macroPrefixAttack + name;
    } else if (attacker.result?.type === 'mystic') {
      macroName = attacker.result.values.spellName;
    } else if (attacker.result?.type === 'psychic') {
      macroName = attacker.result.values.powerName;
    }

    if (attacker.result?.values.macro) {
      macroName = attacker.result?.values.macro;
    }

    executeMacro(macroName, args);
  }
}
