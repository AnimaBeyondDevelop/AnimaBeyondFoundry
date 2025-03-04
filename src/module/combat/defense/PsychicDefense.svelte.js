import { Defense } from './Defense.svelte';
import { ModifiedAbility } from '@module/common/ModifiedAbility.svelte';
import { shieldValueCheck } from '@module/combat/utils/shieldValueCheck.js';

/**
 * @class
 * @extends Defense
 */
export class PsychicDefense extends Defense {
  /** @type {'psychic'} */
  static type = 'psychic';
  /**
   * ID of the used power. Initialised to the last power used.
   * @type {string}
   */
  #power = $state('');

  /** @type {ModifiedAbility} */
  potential;

  /** @type {ABFFoundryRoll} */
  #potentialRoll = $state.raw();

  /** @type {boolean} */
  preventFatigue = $state(false);

  /** @type {boolean} */
  mentalPatternImbalance = $state(false);

  /** @type {number} */
  psychicFatigue;

  /**
   * ID of the used supernatural Shield.
   * @type {string}
   */
  #supernaturalShield = $state('');

  /** @type {boolean} */
  newShield = $state(this.availableSupernaturalShields.length === 0);

  /**
   * @param {Attack} attack The attack to defend against
   */
  constructor(attack) {
    super(attack);
    this.ability.base =
      this.defender.system.psychic.psychicProjection.imbalance.defensive.final.value;

    this.potential = new ModifiedAbility(
      this.defender.system.psychic.psychicPotential.final.value
    );
    this.potential.registerModTable(this.potentialModifiers);

    this.power = this.defender.getLastPowerUsed('defensive') ?? this.availablePowers[0];
  }
  get displayName() {
    return /** @type {string} */ (this.supernaturalShield.name);
  }
  /** @type {Record<string,import('@module/common/ModifiedAbility.svelte').ModifierSpec>} */
  get modifiers() {
    return {
      ...super.modifiers,
      cvs: { value: 0, spec: 20, active: true },
      roll: { value: 0, spec: 1, active: true }
    };
  }
  /** @type {Record<string,import('@module/common/ModifiedAbility.svelte').ModifierSpec>} */
  get potentialModifiers() {
    return {
      cvs: { value: 0, spec: 10, active: true }
    };
  }

  get availablePowers() {
    return this.defender.getPsychicPowers('defense');
  }

  get power() {
    return (
      this.availablePowers.find(w => w.id === this.#power) ?? this.availablePowers[0]
    );
  }

  set power(power) {
    this.#power = power.id ?? '';
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
      this.defender.system.psychic.psychicPoints.value
    );
  }

  get availableSupernaturalShields() {
    return this.defender.getSupernaturalShields();
  }

  get supernaturalShield() {
    let supernaturalShield = {};
    if (this.newShield) {
      supernaturalShield.name = this.power?.name;
      supernaturalShield.system = {
        type: 'psychic',
        damageBarrier: 0,
        shieldPoints: shieldValueCheck(
          this.power?.system.effects[this.isPotentialRolled ? this.potential.final : 0]
            ?.value ?? ''
        ),
        origin: this.defender.uuid
      };
    } else {
      supernaturalShield =
        this.availableSupernaturalShields.find(w => w.id === this.#supernaturalShield) ??
        this.availableSupernaturalShields[0];
    }
    return supernaturalShield;
  }

  /** @param {ABFItem} supernaturalShield */
  set supernaturalShield(supernaturalShield) {
    if (!supernaturalShield) return;

    this.#supernaturalShield = supernaturalShield.id ?? '';
  }

  get shieldPoints() {
    return this.supernaturalShield?.system.shieldPoints;
  }

  get mastery() {
    return (
      this.defender.system.psychic.psychicProjection.imbalance.defensive.base.value >= 200
    );
  }

  toMessage() {
    if (this.psychicFatigue) {
      return;
    }
    super.toMessage();
  }
  get messageFlavor() {
    return game.i18n.format('macros.combat.dialog.psychicDefense.title', {
      power: this.supernaturalShield.name,
      target: this.attackerToken.name
    });
  }

  get isPotentialRolled() {
    return this.#potentialRoll !== undefined;
  }

  async rollPotential() {
    this.#potentialRoll = new ABFFoundryRoll(
      `1d100PsychicRoll + ${this.potential.final}`,
      {
        ...this.defender.system,
        power: this.power,
        mentalPatternImbalance: this.mentalPatternImbalance
      }
    );

    await this.#potentialRoll.roll();
    this.potential.modifiers.roll.value =
      this.#potentialRoll.total - this.potential.final;

    this.psychicFatigue = this.defender.evaluatePsychicFatigue(
      this.power,
      this.potential.final,
      this.preventFatigue,
      this.showRoll
    );
  }

  potentialToMessage() {
    if (!this.showRoll) return;

    let flavor = game.i18n.format('macros.combat.dialog.psychicPotential.title');
    this.#potentialRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.defender }),
      flavor
    });
  }

  toJSON() {
    return {
      ...super.toJSON(),
      powerId: this.newShield ? this.#power : undefined,
      potential: this.potential.toJSON(),
      preventFatigue: this.preventFatigue,
      mentalPatternImbalance: this.mentalPatternImbalance,
      psychicFatigue: this.psychicFatigue,
      potentialRoll: this.#potentialRoll?.toJSON(),
      supernaturalShieldId: this.newShield ? undefined : this.#supernaturalShield
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
      potentialRoll,
      supernaturalShieldId
    } = json;
    this.newShield = powerId != undefined;

    const power = this.availablePowers.find(p => p.id === powerId);
    if (power) {
      this.power = power;
    }

    const supernaturalShield = this.availableSupernaturalShields.find(
      s => s.id === supernaturalShieldId
    );
    if (supernaturalShield) {
      this.supernaturalShield = supernaturalShield;
    }

    if (!supernaturalShield && !power) {
      throw new Error(
        `Either power or supernaturalSield must be specified for a PsychicDefense.`
      );
    }

    this.potential = ModifiedAbility.fromJSON(potential);
    this.preventFatigue = preventFatigue;
    this.mentalPatternImbalance = mentalPatternImbalance;
    this.psychicFatigue = psychicFatigue;
    this.#potentialRoll = ABFFoundryRoll.fromData(potentialRoll);
    return this;
  }
}

Defense.registerDefenseClass(PsychicDefense);
