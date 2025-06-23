import { Templates } from '../../utils/constants';
import { calculateCombatResult } from '../../combat/utils/calculateCombatResult';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { executeMacro } from '../../utils/functions/executeMacro';
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
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['abf-dialog gm-combat-dialog'],
      submitOnChange: true,
      closeOnSubmit: false,
      height: 600,
      width: 700,
      template: 'systems/abf/templates/dialog/combat/gm-combat-dialog.hbs',
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
      const resistance =
        this.defenderActor.system.characteristics.secondaries.resistances[type].base
          .value;
      let formula = `1d100 + ${resistance ?? 0} - ${value ?? 0}`;
      const resistanceRoll = new ABFFoundryRoll(formula, this.defenderActor.system);
      await resistanceRoll.roll();
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
      this.applyValuesIfBeAble(resistanceRoll.total);
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

      

      if (this.isDamagingCombat) {

        const { weapon } = attacker.result;
        const finalAt = Math.max(defender.result.values.at - weapon.system.reducedArmor.final.value, 0);
        const finalBaseDamage = attacker.result.values.damage - this.defenderActor.system.combat.damageReduction.final.value;

        const combatResult = calculateCombatResult(
          attackerTotal,
          defenderTotal,
          finalAt,
          finalBaseDamage,
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
            this.modalData.ui.resistanceRoll = true;
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
    this.modalData = foundry.utils.mergeObject(this.modalData, formData);

    this.render();
  }
  async applyValuesIfBeAble(resistanceRoll) {
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

    this.executeCombatMacro(resistanceRoll);
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
        const { weapon } = attacker.result; 

        newCombatResult.attack = Math.max(
          attacker.result.values.total + this.modalData.attacker.customModifier,
          0
        );
        newCombatResult.at = Math.max(
          defender.result.values.at - weapon.system.reducedArmor.final.value,
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

  executeCombatMacro(resistanceRoll) {
    const missedAttackValue = game.settings.get(
      'abf',
      ABFSettingsKeys.MACRO_MISS_ATTACK_VALUE
    );
    const macroPrefixAttack = game.settings.get(
      'abf',
      ABFSettingsKeys.MACRO_PREFIX_ATTACK
    );
    const { attacker, defender, calculations } = this.modalData
    const winner =
      calculations.winner === this.defenderToken
        ? 'defender'
        : 'attacker';
    let macroName;
    let args = {
      attacker: this.attackerToken,
      spellGrade: attacker.result.values.spellGrade,
      psychicPotential: attacker.result.values?.psychicPotential,
      projectile: attacker.result.values?.projectile,
      defenders: [{
        defender: this.defenderToken,
        winner,
        defenseType: defender.result.type === 'combat' ? defender.result.values.type : defender.result.type,
        totalAttack: attacker.result.values.total,
        appliedDamage: calculations.damage,
        damageType: attacker.result.values?.critic,
        bloodColor: 'red', // add bloodColor to actor template
        missedAttack: false,
        resistanceRoll,
        defenderPsychicFatigue: defender.result.values?.psychicFatigue,
        criticImpact: 0
      }]
    };
    if (args.defenders[0].totalAttack < missedAttackValue && winner === 'defener') {
      args.defenders[0].missedAttack = true;
    }

    if (attacker.result?.type === 'combat') {
      if (!attacker.result.weapon) {
        attacker.result.weapon = { name: 'Unarmed' }
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

    executeMacro(macroName, args)
  }
}
