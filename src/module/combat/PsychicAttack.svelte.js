import { Attack } from './Attack.svelte';
import { damageCheck } from '@module/combat/utils/damageCheck.js';
import { ModifiedAbility } from '@module/common/ModifiedAbility.svelte';
import { resistanceEffectCheck } from '@module/combat/utils/resistanceEffectCheck.js';

export class PsychicAttack extends Attack {
  /** @type {'psychic'} */
  type = 'psychic';
  /**
   * ID of the used power. Initialised to the last power used.
   * @type {string}
   */
  #power = $state('');

  /**
   * @type {Record<string,import('@module/common/ModifiedAbility.svelte').ModifierSpec>}
   */
  #modifiers = {
    psychicProjection: { value: 0, spec: 10, active: true },
  };

  /** @type {ModifiedAbility} */
  potential;

  /**
   * @type {Record<string,import('@module/common/ModifiedAbility.svelte').ModifierSpec>}
   */
  #potentialModifiers = {
    psychicPotential: { value: 0, spec: 20, active: true },
    psychicRoll: { value: 0, spec: 1, active: true },
  };

  /** @type {ABFFoundryRoll} */
  #psychicRoll = $state.raw(undefined);

  /**
   * @type {boolean}
   */
  preventFatigue = $state(false);

  /**
   * @type {boolean}
   */
  mentalPatternImbalance = false;

  psychicFatigue;


  /**
   * @param {import('@module/actor/ABFActor').ABFActor} attacker The attacker actor.
   * @param {number} [counterattackBonus] Counterattack bonus or undefined if this is not a counterattack.
   */
  constructor(attacker, counterattackBonus) {
    super(attacker, counterattackBonus);

    this.power =
      this.attacker.getLastPowerUsed('offensive') ?? this.availablePowers[0];
    this.ability.base = this.attacker.system.psychic.psychicProjection.imbalance.offensive.final.value;
    this.ability.registerModTable(this.#modifiers);
    this.potential = new ModifiedAbility(this.attacker.system.psychic.psychicPotential.final.value);
    this.potential.registerModTable(this.#potentialModifiers);
  }

  get modifiers() {
    return this.#modifiers;
  }

  get availablePowers() {
    return this.attacker.getPsychicPowers("attack");
  }

  get power() {
    return this.availablePowers.find(w => w.id === this.#power);
  }

  set power(power) {
    this.#power = power?.id;
    this.critic = power.system.critic.value;
  }

  get availablePsychicPoints() {
    let available = this.attacker.system.psychic.psychicPoints.value
    let usedProjection = this.#modifiers.psychicProjection.value
    let usedPotential = this.#potentialModifiers.psychicPotential.value
    let usedPreventFatigue = this.preventFatigue ? 1 : 0
    return {
      projection: Math.min(available - usedPotential - usedPreventFatigue, 5),
      potential: Math.min(available - usedProjection - usedPreventFatigue, 5),
      preventFatigue: Math.max(available - usedProjection - usedPotential, 0)
    }
  }

  get mastery() {
    return this.attacker.system.psychic.psychicProjection.imbalance.offensive.base.value >= 200;
  }

  toMessage() {
    if (this.psychicFatigue) { return }

    let flavor = game.i18n.format(
      'macros.combat.dialog.psychicAttack.title',
      {
        power: this.power.name,
        potential: this.potential.final,
        target: this._defenderToken.name
      }
    );
    super.toMessage(flavor);
  }

  get isPsychicRolled() {
    return this.#psychicRoll !== undefined;
  }

  async psychicRoll() {
    this.#psychicRoll = new ABFFoundryRoll(
      `1d100PsychicRoll + ${this.potential.final}`,
      { ...this.attacker.system, power: this.power, mentalPatternImbalance: this.mentalPatternImbalance }
    );;

    await this.#psychicRoll.roll();
    this.evaluatePsychicFatigue();
    let powerEffect = this.power?.system.effects[this.#psychicRoll.total].value;
    this.damage.base = damageCheck(powerEffect);
    this.potential.modifiers.psychicRoll.value = this.#psychicRoll.total - this.potential.final;
  }

  potentialToMessage() {
    if (!this.showRoll) return;

    let flavor = game.i18n.format('macros.combat.dialog.psychicPotential.title');
    this.#psychicRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.attacker }),
      flavor
    });
  }

  evaluatePsychicFatigue() {
    if (!this.isPsychicRolled) return;

    this.psychicFatigue = this.attacker.evaluatePsychicFatigue(
      this.power,
      this.#psychicRoll.total,
      this.preventFatigue,
      this.showRoll
    );
  }

  get resistanceEffect() {
    if (!this.isPsychicRolled) return;

    let powerEffect = this.power?.system.effects[this.#psychicRoll.total].value;
    return resistanceEffectCheck(powerEffect);
  }
}
