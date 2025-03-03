import { ModifiedAbility } from '@module/common/ModifiedAbility.svelte';
import ABFFoundryRoll from '@module/rolls/ABFFoundryRoll';
import { ABFSettingsKeys } from '@utils/registerSettings';
import { Attack } from '../attack';

/**
 * @typedef {"physic"|"mystic"|"psychic"} DefenseType
 */

/**
 * @abstract
 */
export class Defense {
  /** @type {DefenseType} */
  static type;
  /** @type {DefenseType} */
  get type() {
    return /** @type {typeof Defense}*/ (this.constructor).type;
  }
  /** @type {Attack} The attack to defend against */
  #attack;
  /** @type {ModifiedAbility} */
  ability = new ModifiedAbility();
  /** @type {ModifiedAbility} */
  at;
  /** @type {boolean} Wether to roll a die for combat or not. Defaults to `true`. */
  withRoll = $state(true);
  /** @type {ABFFoundryRoll} */
  #roll;

  /** @type {Record<string,import('@module/common/ModifiedAbility.svelte').ModifierSpec>} */
  get modifiers() {
    return {
      blindness: { value: 1, spec: -80, active: false },
      partialBlindness: { value: 1, spec: -30, active: false }
    };
  }

  // Defaults from settings ============
  /**
   * @type {boolean} Default setting for showing rolls in chat, set in system settings.
   */
  showRollDefault = !!game.settings?.get(
    'animabf',
    ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
  );

  /**
   * @param {Attack} attack The attack to defend against
   */
  constructor(attack) {
    this.#attack = attack;

    this.ability.registerModTable(this.modifiers);
    this.ability.modifiers.blindness.active = this.#attack.visible
      ? false
      : (this.#attack.type === 'mystic' && !this.defenderPerceiveMystic) ||
        (this.#attack.type === 'psychic' && !this.defenderPerceivePsychic);

    this.at = new ModifiedAbility(
      this.defender.system.combat.totalArmor.at[attack.critic]?.value ?? 0
    );
  }

  get attack() {
    return this.#attack;
  }

  get defenderToken() {
    return this.#attack.defenderToken;
  }
  get attackerToken() {
    return this.#attack.attackerToken;
  }
  get defender() {
    return this.#attack.defender;
  }
  get attacker() {
    return this.#attack.attacker;
  }

  get defenderPerceiveMystic() {
    return this.#attack.defender.system.general.settings.perceiveMystic.value;
  }

  get defenderPerceivePsychic() {
    return this.#attack.defender.system.general.settings.perceivePsychic.value;
  }

  get displayName() {
    return '';
  }

  get mastery() {
    return false;
  }

  async roll() {
    const mod = this.mastery ? 'xamastery' : 'xa';
    const formula = (this.withRoll ? `1d100${mod} + ` : '') + `${this.ability.final}`;
    this.#roll = new ABFFoundryRoll(formula, this.defender.system);
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
      speaker: ChatMessage.getSpeaker({ token: this.defenderToken }),
      flavor
    });
  }

  toJSON() {
    let { type, ability, at, withRoll } = this;
    return {
      type,
      attack: this.#attack.toJSON(),
      attackerId: this.attackerToken.id,
      defenderId: this.defenderToken.id,
      ability: ability.toJSON(),
      at: at.toJSON(),
      withRoll,
      roll: this.#roll?.toJSON()
    };
  }

  /** @param {ReturnType<Defense['toJSON']>} json */
  loadJSON(json) {
    let { ability, at, withRoll } = json;
    this.ability = ModifiedAbility.fromJSON(ability);
    this.at = ModifiedAbility.fromJSON(at);
    this.withRoll = withRoll;
    this.#roll = ABFFoundryRoll.fromData(json.roll);

    return this;
  }

  /** @param {ReturnType<Defense['toJSON']>} json */
  static fromJSON(json) {
    const { type } = json;
    const attack = Attack.fromJSON(json.attack);

    if (!attack)
      throw new Error('Defense cannot be recovered from JSON: no attack given');
    const Subclass = this.#defenseClasses.get(type);
    if (!Subclass) throw new Error('Defense subclass not found for type: ' + type);
    let defense = new Subclass(attack);
    return defense.loadJSON(json);
  }

  /** @type {Map<DefenseType, typeof Defense>} */
  static #defenseClasses = new Map();
  /**
   * @template {typeof Defense} T
   * @param {T} cls
   */
  static registerDefenseClass(cls) {
    this.#defenseClasses.set(cls.type, cls);
  }
}
