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

  get isCounterattack() {
    return 'counterattackBonus' in this.ability.modifiers;
  }

  get isRolled() {
    return this.#roll !== undefined && this.#roll.total;
  }

  async roll() {
    const mod = this.ability.final < 200 ? 'xa' : 'xamasery';
    const formula = `1d100${mod} + ${this.ability.final}`;
    this.#roll = new ABFFoundryRoll(formula, this.attacker.system);
    await this.#roll.roll();
  }

  get rolled() {
    if (!this.#roll?.total) return undefined;
    return this.#roll.total - this.ability.final;
  }

  get fumbled() {
    return this.#roll.fumbled;
  }

  get openRoll() {
    return this.#roll.openRoll;
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
