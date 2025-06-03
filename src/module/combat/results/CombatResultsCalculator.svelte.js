import { ceilToMultiple, floorTo5Multiple, floorToMultiple } from '@utils/rounding';
import { calculateDamage } from '../utils/calculateDamage';
import { ABFSettingsKeys } from '@utils/registerSettings';
/**
 * @typedef {Object} Attack Object wrapping the attack-related properties.
 * @property {number} finalAbility Total attack ability.
 * @property {number} finalDamage The base damage of the attack.
 * @property {boolean} [halvedAbsorption] Whether the defender's absorption should be halved or not.
 *
 * @typedef {Object} Defense Object wrapping the defense-related properties.
 * @property {number} finalAbility Total attack ability.
 * @property {number} finalAt The AT of the defense.
 * @property {boolean} [halvedAbsorption] Whether the defender's absorption should be halved or not.
 */

/**
 * Class to calculate the results of a combat.
 * @class
 */
export class CombatResultsCalculator {
  /** @type {Attack} */
  #attack;
  /** @type {Defense} */
  #defense;

  needToRoundDamage = game.settings.get(
    'animabf',
    ABFSettingsKeys.ROUND_DAMAGE_IN_MULTIPLES_OF_5
  );
  useCombatTable = game.settings.get('animabf', ABFSettingsKeys.USE_DAMAGE_TABLE);

  /**
   * @param {Attack} attack
   * @param {Defense} defense
   */
  constructor(attack, defense) {
    this.#attack = attack;
    this.#defense = defense;
  }

  get attackAbility() {
    return this.#attack.finalAbility;
  }

  get defenseAbility() {
    return this.#defense.finalAbility;
  }

  get at() {
    return Math.clamp(this.#defense.finalAt - (this.#attack.atReduction ?? 0), 0, 10);
  }

  /** Base damage of the attack */
  get baseDamage() {
    return this.#attack.finalDamage;
  }

  get halvedAbsorption() {
    return this.#attack.halvedAbsorption || this.#defense.halvedAbsorption;
  }

  /** @type {number} */
  get totalDifference() {
    return this.attackAbility - this.defenseAbility;
  }

  get canCounterAttack() {
    if (!this.totalDifference) return;
    return this.totalDifference < 0;
  }

  get counterAttackBonus() {
    if (!this.canCounterAttack) return 0;
    return Math.min(floorTo5Multiple(-this.totalDifference / 2), 150);
  }

  get damagePercentage() {
    if (this.totalDifference <= 0) return 0;

    let finalAt = this.halvedAbsorption ? Math.floor(this.at / 2) : this.at;
    let baseDifference =
      this.totalDifference -
      (this.useCombatTable
        ? finalAt * 10
        : (this.at * 10 + 20) / (this.halvedAbsorption ? 2 : 1));

    if (this.useCombatTable && this.totalDifference < 50 && finalAt <= 1) {
      return this.totalDifference < 30
        ? 0
        : this.totalDifference < 40
        ? 10
        : floorToMultiple(this.totalDifference - (finalAt * 10 + 10), 10);
    }

    return Math.max(floorToMultiple(baseDifference, 10), 0);
  }

  /** Final damage dealt by the attacker to the defender. */
  get damage() {
    const dealtDamage =
      (ceilToMultiple(this.baseDamage, 10) * this.damagePercentage) / 100;

    // TODO: remove checking when sure it works
    const result = this.needToRoundDamage ? floorTo5Multiple(dealtDamage) : dealtDamage;
    if (
      dealtDamage !==
      calculateDamage(
        this.attackAbility,
        this.defenseAbility,
        this.at,
        this.baseDamage,
        this.halvedAbsorption
      )
    ) {
      throw new Error('Damage calculation different from old implementation');
    }
    return result;
  }

  toJSON() {
    return {
      canCounterAttack: this.canCounterAttack,
      counterAttackBonus: this.counterAttackBonus,
      damage: this.damage
    };
  }
}
