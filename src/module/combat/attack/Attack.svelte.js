import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { ModifiedAbility } from '@module/common/ModifiedAbility.svelte';
import ABFFoundryRoll from '@module/rolls/ABFFoundryRoll';
import { Logger } from '@utils/log';

/**
 * @import { ABFActor } from '@module/actor/ABFActor';
 * @typedef {"physic"|"mystic"|"psychic"} AttackType
 */

/**
 * @abstract
 */
export class Attack {
  /** @type {AttackType} */
  static type;
  /** @type {AttackType} */
  get type() {
    return /** @type {typeof Attack}*/ (this.constructor).type;
  }
  /** @type {TokenDocument} */
  #attackerToken;
  /** @type {TokenDocument} */
  #defenderToken;
  /** @type {ModifiedAbility} */
  ability = new ModifiedAbility();
  /** @type {ModifiedAbility} */
  damage = new ModifiedAbility();
  /** @type {string} */
  critic = $state('-');
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
   * @param {TokenDocument} attacker The attacker token.
   * @param {TokenDocument} defender The defender token.
   * @param {number} [counterattackBonus] Counterattack bonus or undefined if this is not a counterattack.
   */
  constructor(attacker, defender, counterattackBonus) {
    this.#attackerToken = attacker;
    this.#defenderToken = defender;
    if (counterattackBonus) {
      this.ability.addModifier('counterattackBonus', { value: counterattackBonus });
    }
  }
  /**
   * @type {ABFActor} The attacker actor.
   */
  get attacker() {
    return this.#attackerToken.actor;
  }
  get attackerToken() {
    return this.#attackerToken;
  }
  /**
   * @type {ABFActor} The attacker actor.
   */
  get defender() {
    return this.#defenderToken.actor;
  }
  get defenderToken() {
    return this.#defenderToken;
  }

  get displayName() {
    return '...';
  }
  /** @type {boolean} Whether the attack is visible or not. Defaults to `true`. */
  get visible() {
    return true;
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
   * @returns {number | undefined} The distance if automated distance calculation is enabled, otherwise `undefined`.
   */
  get distance() {
    if (!canvas || !canvas.grid) return;
    if (!this.combatDistanceDefault) return;

    let measurePath = canvas.grid.measurePath(
      [
        { x: this.attackerToken.x, y: this.attackerToken.y },
        { x: this.defenderToken.x, y: this.defenderToken.y }
      ],
      {}
    );
    return measurePath.distance / (canvas.dimensions?.distance ?? 1);
  }

  /**
   * @type {boolean} Whether the combat is melee or ranged.
   * Automated if combat distance automation is enabled in settings.
   *
   * Note: not to be confused with `.isRanged`. While this property referes to the position of combatants,
   * `.isRanged` referes to the nature of the attack.
   */
  get meleeCombat() {
    if (this.combatDistanceDefault && this.distance) return this.distance <= 1;
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

  /** @return {string} */
  get messageFlavor() {
    throw new Error(`${this.constructor.name} must implement messageFlavor getter.`);
  }

  toMessage() {
    if (!this.showRoll) return;

    let flavor = this.messageFlavor;
    if (this.openRoll) {
      flavor = flavor.replace('<b>', '<b style="color:green">');
    } else if (this.fumbled) {
      flavor = flavor.replace('<b>', '<b style="color:red">');
    }

    this.#roll.toMessage({
      speaker: ChatMessage.getSpeaker({ token: this.attackerToken }),
      flavor
    });
  }

  toJSON() {
    let { type, ability, damage, critic, visible, withRoll } = this;
    return $state.snapshot({
      type,
      attackerId: this.attackerToken.id,
      defenderId: this.defenderToken.id,
      ability: ability.toJSON(),
      damage: damage.toJSON(),
      critic,
      visible,
      meleeCombat: this.meleeCombat,
      withRoll,
      roll: this.#roll?.toJSON()
    });
  }

  /** @param {ReturnType<Attack['toJSON']>} json */
  loadJSON(json) {
    let { ability, damage, critic, visible, meleeCombat, withRoll } = json;
    this.ability = ModifiedAbility.fromJSON(ability);
    this.damage = ModifiedAbility.fromJSON(damage);
    this.critic = critic;
    this.visible = visible;
    this.meleeCombat = meleeCombat;
    this.withRoll = withRoll;
    this.#roll = ABFFoundryRoll.fromData(json.roll);

    return this;
  }

  /** @param {ReturnType<Attack['toJSON']>} json */
  static fromJSON(json) {
    try {
      let { attackerId, defenderId, type } = json;
      const attacker = game.scenes?.active?.tokens.get(attackerId);
      const defender = game.scenes?.active?.tokens.get(defenderId);

      if (!attacker || !defender)
        throw new Error(
          'Attack cannot be recovered from JSON: Tokens not found for attackerId:' +
            attackerId +
            'and defenderId:' +
            defenderId
        );
      const Subclass = this.#attackClasses.get(type);
      if (!Subclass) throw new Error('Attack subclass not found for type: ' + type);
      let attack = new Subclass(attacker, defender);
      return attack.loadJSON(json);
    } catch (error) {
      Logger.error(error);
    }
  }

  /** @type {Map<AttackType, typeof Attack>} */
  static #attackClasses = new Map();
  /**
   * @template {typeof Attack} T
   * @param {T} cls
   */
  static registerAttackClass(cls) {
    this.#attackClasses.set(cls.type, cls);
  }
}
