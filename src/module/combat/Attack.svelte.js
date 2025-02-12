import { ABFSettingsKeys } from '../../utils/registerSettings';
import { ModifiedAbility } from '@module/common/ModifiedAbility.svelte';
import ABFFoundryRoll from '@module/rolls/ABFFoundryRoll';

/**
 * @import { ABFActor } from '@module/actor/ABFActor';
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
  /** @type {boolean} Whether the attack is visible or not. Defaults to `true`. */
  visible = $state(true);
  /**
   * @type {boolean} Whether the combat is melee or not, used when combat distance is not automated.
   * Defaults to `false`.
   */
  #meleeCombat = $state(false);
  /** @type {ABFFoundryRoll} */
  #roll;
  /** @type {boolean} Wether to roll a die for combat or not. Defaults to `true`. */
  withRoll = $state(true);

  // Defaults from settings ============
  /**
   * @type {boolean} Default setting for showing rolls in chat, set in system settings.
   */
  showRollDefault = !!game.settings.get(
    'animabf',
    ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
  );
  /** @type {boolean} Default setting for automating combat distance, set in system settings. */
  combatDistanceDefault = !!game.settings.get(
    'animabf',
    ABFSettingsKeys.AUTOMATE_COMBAT_DISTANCE
  );

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
  }
  /**
   * @type {ABFActor} The attacker actor.
   */
  get attacker() {
    return this._attackerToken.actor;
  }

  get displayName() {
    return '';
  }

  get isCounterattack() {
    return 'counterattackBonus' in this.ability.modifiers;
  }

  get mastery() {
    return false;
  }

  async roll() {
    const mod = this.mastery ? 'xamastery' : 'xa';
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

  /** Function calculating the distance for the attack.
   * @returns {number} The distance if automated distance calculation is enabled, otherwise `undefined`.
   */
  get distance() {
    if (this.combatDistanceDefault) {
      let measurePath = canvas.grid.measurePath([
        { x: this._attackerToken.x, y: this._attackerToken.y },
        { x: this._defenderToken.x, y: this._defenderToken.y }
      ]);
      return measurePath.distance / canvas.dimensions.distance;
    }
    return undefined;
  }

  /**
   * @type {boolean} Whether the combat is melee or ranged.
   * Automated if combat distance automation is enabled in settings.
   *
   * Note: not to be confused with `.isRanged`. While this property referes to the position of combatants,
   * `.isRanged` referes to the nature of the attack.
   */
  get meleeCombat() {
    if (this.combatDistanceDefault) return this.distance <= 1;
    return this.#meleeCombat;
  }

  set meleeCombat(value) {
    if (this.combatDistanceDefault) return;
    this.#meleeCombat = value;
  }

  /**
   * @type {boolean} Whether the attack is intrinsecally ranged. Defaults to `true`.
   *
   * Note: not to be confused with `.meleeCombat`. While this property referes to the attack nature,
   * `.meleeCombat` referes to the position of the combatants instead.
   */
  get isRanged() {
    return true;
  }

  get showRoll() {
    return !game.user?.isGM || this.showRollDefault;
  }

  /**
   * @param {string} flavor
   */
  toMessage(flavor) {
    if (!this.showRoll) {
      return;
    }

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
