import { ModifiedAbility } from '@module/common/ModifiedAbility.svelte';
import { ceilToMultiple, floorTo5Multiple, floorToMultiple } from '@utils/rounding';
import { calculateDamage } from '../utils/calculateDamage';
import { ABFSettingsKeys } from '@utils/registerSettings';

/**
 * Class to calculate the results of a combat.
 * @class
 */
export class CombatResultsCalculator {
  /** @type {number | ModifiedAbility} */
  #attackAbility;
  /** @type {number | ModifiedAbility} */
  #defenseAbility;
  /** @type {number | ModifiedAbility} */
  #at;
  /** @type {number | ModifiedAbility} */
  #baseDamage;
  halvedAbsorption = false;

  needToRoundDamage = game.settings.get(
    'animabf',
    ABFSettingsKeys.ROUND_DAMAGE_IN_MULTIPLES_OF_5
  );
  useCombatTable = game.settings.get('animabf', ABFSettingsKeys.USE_DAMAGE_TABLE);

  /**
   * @param {number | ModifiedAbility} attackAbility
   * @param {number | ModifiedAbility} defenseAbility
   * @param {number | ModifiedAbility} at
   * @param {number | ModifiedAbility} baseDamage
   * @param {boolean} [halvedAbsorption=false]
   */
  constructor(attackAbility, baseDamage, defenseAbility, at, halvedAbsorption) {
    this.#attackAbility = attackAbility;
    this.#baseDamage = baseDamage;
    this.#defenseAbility = defenseAbility;
    this.#at = at;
    if (halvedAbsorption !== undefined) this.halvedAbsorption = halvedAbsorption;
  }

  get attackAbility() {
    if (this.#attackAbility instanceof ModifiedAbility) return this.#attackAbility.final;
    return this.#attackAbility;
  }

  get defenseAbility() {
    if (this.#defenseAbility instanceof ModifiedAbility)
      return this.#defenseAbility.final;
    return this.#defenseAbility;
  }

  get at() {
    if (this.#at instanceof ModifiedAbility) return this.#at.final;
    return this.#at;
  }

  get baseDamage() {
    if (this.#baseDamage instanceof ModifiedAbility) return this.#baseDamage.final;
    return this.#baseDamage;
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
    if (!this.canCounterAttack) return;
    return Math.min(floorTo5Multiple(-this.totalDifference / 2), 150);
  }

  get damagePercentage() {
    let percent = 0;
    if (this.totalDifference <= 0) return 0;
    if (this.useCombatTable) {
      let finalAt = this.halvedAbsorption ? Math.floor(this.at / 2) : this.at;
      if (this.totalDifference < 30) percent = 0;
      else if (this.totalDifference < 50 && finalAt <= 1) {
        if (this.totalDifference < 40 && finalAt == 0) percent = 10;
        else percent = floorToMultiple(this.totalDifference - (finalAt * 10 + 10), 10);
      } else percent = floorToMultiple(this.totalDifference - finalAt * 10, 10);
    } else {
      let absorption = this.at * 10 + 20;
      if (this.halvedAbsorption) absorption = absorption / 2;
      percent = floorToMultiple(this.totalDifference - absorption, 10) * 10;
    }

    if (percent < 0) throw new Error('Negative damage percentage');

    return percent;
  }

  get damage() {
    const dealtDamage =
      (ceilToMultiple(this.baseDamage, 10) * this.damagePercentage) / 100;

    // TODO: remove checking when sure it works
    const result = this.needToRoundDamage ? floorTo5Multiple(dealtDamage) : dealtDamage;
    if (
      result !==
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
