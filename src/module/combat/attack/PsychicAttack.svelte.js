import { Attack } from './Attack.svelte';
import { damageCheck } from '@module/combat/utils/damageCheck.js';
import { ModifiedAbility } from '@module/common/ModifiedAbility.svelte';
import { resistanceEffectCheck } from '@module/combat/utils/resistanceEffectCheck.js';
import ABFFoundryRoll from '@module/rolls/ABFFoundryRoll';

/**
 * @import ABFItem from "@module/items/ABFItem";
 */

/**
 * @class
 * @extends {Attack}
 */
export class PsychicAttack extends Attack {
  /** @type {'psychic'} */
  static type = 'psychic';
  /**
   * ID of the used power. Initialised to the last power used.
   * @type {string}
   */
  #power = $state('');

  /**
   * @type {Record<string,import('@module/common/ModifiedAbility.svelte').ModifierSpec>}
   */
  #projectionModifiers = {
    cvs: { value: 0, spec: 10, active: true }
  };

  /** @type {ModifiedAbility} */
  potential;

  /**
   * @type {Record<string,import('@module/common/ModifiedAbility.svelte').ModifierSpec>}
   */
  #potentialModifiers = {
    cvs: { value: 0, spec: 20, active: true },
    // TODO: maybe is a good idea to have the roll inside the modified ability also in combat abiliy?
    roll: { value: 0, spec: 1, active: true }
  };

  /** @type {ABFFoundryRoll} */
  #potentialRoll = $state.raw();

  /**
   * @type {boolean}
   */
  preventFatigue = $state(false);

  /**
   * @type {boolean}
   */
  mentalPatternImbalance = $state(false);

  /** @type {number} */
  psychicFatigue;

  /**
   * @param {TokenDocument} attacker The attacker token.
   * @param {TokenDocument} defender The defender token.
   */
  constructor(attacker, defender) {
    super(attacker, defender);

    this.ability.base =
      this.attacker.system.psychic.psychicProjection.imbalance.offensive.final.value;
    this.ability.registerModTable(this.projectionModifiers);

    this.potential = new ModifiedAbility(
      this.attacker.system.psychic.psychicPotential.final.value
    );
    this.potential.registerModTable(this.potentialModifiers);

    this.power = this.attacker.getLastPowerUsed('offensive') ?? this.availablePowers[0];

    this.preventFatigue = this.defender.system.psychic.psychicSettings.fatigueResistance;
  }

  /** @param {import("@module/combat/results/CombatResults.svelte").CombatResults} results */
  onApply(results) {
    this.attacker.consumePsychicPoints(
      Object.values(this.usedPsychicPoints).reduce((acc, val) => acc + val, 0)
    );
    this.attacker.applyPsychicFatigue(this.psychicFatigue);
  }

  get displayName() {
    return /** @type {string} */ (this.power.name);
  }

  get projectionModifiers() {
    return this.#projectionModifiers;
  }
  get potentialModifiers() {
    return this.#potentialModifiers;
  }

  get availablePowers() {
    return this.attacker.getPsychicPowers('attack');
  }

  /** @type {ABFItem} */
  get power() {
    return (
      this.availablePowers.find(w => w.id === this.#power) ?? this.availablePowers[0]
    );
  }

  set power(power) {
    this.#power = power.id ?? '';
    this.critic = power.system.critic.value;
  }

  get usedPsychicPoints() {
    return {
      projection: this.isRolled ? this.ability.modifiers.cvs.value : 0,
      potential: this.isPotentialRolled ? this.potential.modifiers.cvs.value : 0,
      preventFatigue: this.preventFatigue ? 1 : 0
    };
  }

  /** @type {number} */
  get availablePsychicPoints() {
    return Object.values(this.usedPsychicPoints).reduce(
      (acc, val) => acc - val,
      this.attacker.system.psychic.psychicPoints.value
    );
  }

  get visible() {
    return this.power?.system.visible ?? true;
  }

  get mastery() {
    return (
      this.attacker.system.psychic.psychicProjection.imbalance.offensive.base.value >= 200
    );
  }

  toMessage() {
    if (this.psychicFatigue) return;
    return super.toMessage();
  }

  get messageFlavor() {
    return game.i18n.format('macros.combat.dialog.psychicAttack.title', {
      power: this.power.name,
      potential: this.potential.final,
      target: this.defenderToken.name
    });
  }

  get isPotentialRolled() {
    return this.#potentialRoll !== undefined;
  }

  async rollPotential() {
    this.#potentialRoll = new ABFFoundryRoll(
      `1d100PsychicRoll + ${this.potential.final}`,
      {
        ...this.attacker.system,
        power: this.power,
        mentalPatternImbalance: this.mentalPatternImbalance
      }
    );

    await this.#potentialRoll.roll();
    this.potential.modifiers.roll.value =
      this.#potentialRoll.total - this.potential.final;

    this.psychicFatigue = this.attacker.evaluatePsychicFatigue(
      this.power,
      this.potential.final,
      this.preventFatigue,
      this.showRoll,
      false
    );

    let powerEffect = this.power?.system.effects[this.potential.final].value;
    this.damage.base = damageCheck(powerEffect);
  }

  potentialToMessage() {
    if (!this.showRoll) return;

    let flavor = game.i18n.format('macros.combat.dialog.psychicPotential.title');
    this.#potentialRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.attacker }),
      flavor
    });
  }

  get resistanceEffect() {
    if (!this.isPotentialRolled) return;

    let powerEffect = this.power?.system.effects[this.#potentialRoll.total].value;
    return resistanceEffectCheck(powerEffect);
  }

  onAttack() {
    this.attacker.setLastPowerUsed(this.power, 'offensive');
    return super.onAttack();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      powerId: this.#power,
      potential: this.potential.toJSON(),
      preventFatigue: this.preventFatigue,
      mentalPatternImbalance: this.mentalPatternImbalance,
      psychicFatigue: this.psychicFatigue,
      potentialRoll: this.#potentialRoll?.toJSON()
    };
  }

  /** @param {ReturnType<PsychicAttack['toJSON']>} json */
  loadJSON(json) {
    super.loadJSON(json);

    let {
      powerId,
      potential,
      preventFatigue,
      mentalPatternImbalance,
      psychicFatigue,
      potentialRoll
    } = json;

    const power = this.availablePowers.find(p => p.id === powerId);
    if (!power)
      throw new Error(
        `Power ${powerId} not found in actor's (${this.attacker.id}) available powers`
      );
    this.potential = ModifiedAbility.fromJSON(potential);
    this.preventFatigue = preventFatigue;
    this.mentalPatternImbalance = mentalPatternImbalance;
    this.psychicFatigue = psychicFatigue;
    this.#potentialRoll = ABFFoundryRoll.fromData(potentialRoll);
    return this;
  }
}

Attack.registerAttackClass(PsychicAttack);
