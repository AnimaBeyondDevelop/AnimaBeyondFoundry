import { ABFSettingsKeys } from '../../utils/registerSettings';
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
  /** @type {Token} */
  _attackerToken;
  /** @type {Token} */
  _defenderToken;
  /** @type {ModifiedAbility} */
  ability;
  /** @type {ModifiedAbility} */
  damage;
  /** @type {string} */
  critic = $state('-');
  /** @type {boolean} Whether the attack is visible or not. Defaults to `true`.*/
  visible = true;
  /** @type {boolean} Whether the attack is at point blank or not. Defaults to `false`.*/
  inMelee = $state(false);
  /** @type {ABFFoundryRoll} */
  #roll;

  /**
   * @param {Token} attacker The attacker token.
   * @param {Token} defender The defender token.
   * @param {number} [counterattackBonus] Counterattack bonus or undefined if this is not a counterattack.
   */
  constructor(attacker, defender, counterattackBonus) {
    this._attackerToken = attacker;
    this._defenderToken = defender;
    this.ability = new ModifiedAbility();
    if (counterattackBonus) {
      this.ability.addModifier('counterattackBonus', { value: counterattackBonus });
    }
    this.damage = new ModifiedAbility();
    this.inMelee = this.distance <= 1;
  }
  /**
   * @type {import('@module/actor/ABFActor').ABFActor} The attacker actor.
   */
  get attacker() {
    return this._attackerToken.actor;
  }

  get isCounterattack() {
    return 'counterattackBonus' in this.ability.modifiers;
  }

  get isRolled() {
    return this.#roll !== undefined && this.#roll.result;
  }

  get mastery() {
    return false;
  }

  async roll() {
    const mod = this.mastery ? 'xa' : 'xamasery';
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

  get distance() {
    const combatDistance = !!game.settings.get(
      'animabf',
      ABFSettingsKeys.AUTOMATE_COMBAT_DISTANCE
    );

    if (combatDistance) {
      let measurePath =
        canvas.grid.measurePath([
          { x: this._attackerToken.x, y: this._attackerToken.y },
          { x: this._defenderToken.x, y: this._defenderToken.y }]
        );
      return measurePath.distance /
        canvas.dimensions.distance
    }
    return;
  }

  get isRanged() {
    return true
  }

  get isPointBlank() {
    return this.isRanged && this.inMelee;
  }

  get showRoll() {
    const showRollByDefault = !!game.settings.get(
      'animabf',
      ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
    );
    const isGM = !!game.user?.isGM;

    return !isGM || showRollByDefault
  }

  /**
   * @param {string} flavor
   */
  toMessage(flavor) {
    if (!this.showRoll) { return }

    if (this.openRoll) {
      flavor = flavor.replace('<b>', '<b style="color:green">');
    } else if (this.fumbled) {
      flavor = flavor.replace('<b>', '<b style="color:red">');
    }

    this.#roll.toMessage({
      speaker: ChatMessage.getSpeaker({ token: this._attackerToken }),
      flavor
    });
  }
}