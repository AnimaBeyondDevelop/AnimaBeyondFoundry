import { Logger } from '@utils/log';

/**
 * @typedef Modifier
 * @property {number} value Number specifying the level of the modifier.
 * @property {boolean} active Whether the modifier is active or not.
 * @property {number} modifier The total modifier
 *
 * @typedef {{[label:string]: Modifier}} ModifierRecord Record with labelled `Modifier`s
 *
 * @typedef ModifierSpec A full spec for initialising a modifier.
 *
 * @property {number | (() => number)} [value] Initial value for the modifier.
 * It can be a (modifiable) number or a function returning the value for the modifier.
 * When a function is provided, `value` is readonly.
 *
 * Defaults to 0.
 *
 * @property {number | ((value: number) => number)} [spec] Specification for calculating this modifier.
 * If spec is a number, the total modifier is `value * spec`, while if it is a function the total
 * modifier is `spec(value)`.
 *
 * Defaults to 1.
 *
 * @property {boolean} [active] Initial value for the active property of the modifier.
 *
 * Defaults to true.
 */

export class ModifiedAbility {
  /** Base value for this ability */
  base = $state(0);
  /** @type {ModifierRecord} Collection of modifiers applied to this ability */
  modifiers = $state({});

  /** @param {number} [base] Defaults to 0 */
  constructor(base = 0) {
    this.base = base;
  }

  /** Final value after applying the modifiers */
  get final() {
    return this.base + this.totalModifier;
  }

  /** Total active modifier */
  get totalModifier() {
    let total = 0;
    for (const mod of Object.values(this.modifiers)) {
      total += mod.active ? mod.modifier : 0;
    }
    return total;
  }

  /**
   * Imports data from a json object.
   * @param {ReturnType<ModifiedAbility['toJSON']>} json
   */
  loadJSON(json) {
    const { base, modifiers } = json;
    this.base = base;
    for (const label in modifiers) {
      const { value, active } = modifiers[label];
      this.updateModifier(label, value, active);
    }
    return this;
  }

  /**
   * Export this instance to a JSON object.
   */
  toJSON() {
    return {
      base: $state.snapshot(this.base),
      modifiers: $state.snapshot(this.modifiers)
    };
  }

  /**
   * Add a new modifier to this ability.
   * @param {string} label String identifying the new modifier.
   * @param {ModifierSpec} specification Specification for initialising the modifier.
   */
  addModifier(label, specification = {}) {
    let { value = 0, spec = 1, active = true } = specification;

    if (this.modifiers && label in this.modifiers) {
      Logger.debug(`Modifier ${label} already exist: ignoring re-addition.`);
      return;
    }

    let mod = {
      value: typeof value === 'number' ? value : 0,
      active,
      /** @type {number} */
      get modifier() {
        if (typeof spec === 'number') {
          return this.value * spec;
        }
        return spec(this.value);
      }
    };
    if (typeof value === 'function') {
      Object.defineProperty(mod, 'value', {
        get() {
          return value();
        },
        configurable: false,
        enumerable: true
      });
    }
    this.modifiers[label] = mod;
  }

  /**
   * Update the value and active status of an existing modifier.
   * When trying to update an unregistered modifier, it will be reported as an error and ignored except
   * for the 'special' modifier.
   * If the modifier's value is read-only, only the active status will be updated and a debug message will be logged.
   *
   * @param {string} label String identifying the modifier to update.
   * @param {number} value New value for the modifier.
   * @param {boolean} active New active status for the modifier.
   */
  updateModifier(label, value, active) {
    if (!(label in this.modifiers)) {
      if (label === 'special') {
        this.addModifier('special', { value, active });
      } else {
        Logger.error(`ModifiedAbility[${label}] does not exist: cannot update modifier.`);
        return;
      }
    }

    this.modifiers[label].active = active;
    try {
      this.modifiers[label].value = value;
    } catch (e) {
      if (e instanceof TypeError) {
        Logger.debug(
          `ModifiedAbility[${label}].value was not updated since it is read-only.`
        );
      } else {
        throw e;
      }
    }
  }

  /**
   * Delete an existing modifier from this ability
   * @param {string} label String identifying the modifier to remove.
   */
  removeModifier(label) {
    delete this.modifiers[label];
  }

  /**
   * Registers a table of modifiers
   * @param {Record<string, ModifierSpec>} modifiers
   */
  registerModTable(modifiers) {
    for (const label in modifiers) {
      if (modifiers.hasOwnProperty(label)) {
        this.addModifier(label, modifiers[label]);
      }
    }
  }

  /**
   * Unregisters a table of modifiers
   * @param {Record<string, number | ((value: number) => number)>} modifiers
   */
  unregisterModTable(modifiers) {
    for (const label in modifiers) {
      if (modifiers.hasOwnProperty(label)) {
        this.removeModifier(label);
      }
    }
  }

  /**
   * Delete all modifiers from a list or object
   * @param {string[]} modifiers
   */
  removeModifiers(modifiers) {
    for (const label of modifiers) {
      this.removeModifier(label);
    }
  }
}
