import { ModifiedAbility } from '@module/common/ModifiedAbility.svelte';
import ABFFoundryRoll from '@module/rolls/ABFFoundryRoll';

/**
 * @typedef {"physic"|"mystic"|"psychic"} AttackType
 */

/**
 * @abstract
 */
export class Attack {
  /** @type {AttackType} */
  type;
  /** @type {import('@module/actor/ABFActor').ABFActor} */
  _attacker;
  /** @type {ModifiedAbility} */
  ability;
  /** @type {ModifiedAbility} */
  damage;
  /** @type {string} */
  critic = $state('-');
  /** @type {ABFFoundryRoll} */
  #roll;
  /** @type {boolean} */
  withRoll = $state(true);

  /**
   * @param {import('@module/actor/ABFActor').ABFActor} attacker The attacker actor.
   * @param {boolean} [visible=true] Whether the attack is visible or not. Defaults to `true`.
   * @param {number} [counterattackBonus] Counterattack bonus or undefined if this is not a counterattack.
   */
  constructor(attacker, visible = true, counterattackBonus) {
    this._attacker = attacker;
    this.ability = new ModifiedAbility();
    if (counterattackBonus) {
      this.ability.addModifier('counterattackBonus', { value: counterattackBonus });
    }
    this.damage = new ModifiedAbility();
    this.visible = visible;
  }

  get attacker() {
    return this._attacker;
  }

  get displayName() {
    return '';
  }

  get isCounterattack() {
    return 'counterattackBonus' in this.ability.modifiers;
  }

  async roll() {
    const mod = this.ability.final < 200 ? 'xa' : 'xamasery';
    const formula = (this.withRoll ? `1d100${mod} + ` : '') + `${this.ability.final}`;
    this.#roll = new ABFFoundryRoll(formula, this.attacker.system);
    await this.#roll.roll();
    return this;
  }

  get isRolled() {
    return this.#roll !== undefined && !!this.#roll.total;
  }

  get rolled() {
    if (!this.isRolled) return undefined;
    return this.#roll.getResults().reduce((sum, value) => sum + value);
  }

  get fumbled() {
    return this.#roll.fumbled;
  }

  get openRoll() {
    return this.#roll.openRoll;
  }

  /**
   * @type {number|undefined} Value of the total attack ability.
   * When not rolled, this is undefined; otherwise is the ability.final plus roll.
   */
  get total() {
    if (!this.rolled) return undefined;
    return this.ability.final + this.rolled;
  }

  /**
   * @param {string} flavor
   */
  toMessage(flavor) {
    if (this.openRoll) {
      flavor.replace('<b>', '<b style="color:green">');
    } else if (this.fumbled) {
      flavor.replace('<b>', '<b style="color:red">');
    }

    this.#roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.attacker }),
      flavor
    });
  }
}
