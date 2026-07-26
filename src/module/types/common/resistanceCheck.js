import {
  createScalableStat,
  ensureScalableStat,
  evaluateScalableStat,
  DEFAULT_ENTITY_POWER_SCALE_PER
} from '../mystic/entityPowerScale.js';

/**
 * Actor resistance keys (`system.characteristics.secondaries.resistances.*`).
 * @readonly
 * @enum {string}
 */
export const ResistanceTypes = {
  PHYSICAL: 'physical',
  DISEASE: 'disease',
  POISON: 'poison',
  MAGIC: 'magic',
  PSYCHIC: 'psychic'
};

/** @readonly */
export const RESISTANCE_TYPE_KEYS = Object.freeze(Object.values(ResistanceTypes));

/**
 * When several resistance types apply, which defender score is used.
 * @readonly
 * @enum {string}
 */
export const ResistanceSelectionModes = {
  HIGHEST: 'highest',
  LOWEST: 'lowest'
};

/**
 * How / when the resistance check is forced.
 * @readonly
 * @enum {string}
 */
export const ResistanceApplicationModes = {
  ON_HIT: 'onHit',
  AUTOMATIC: 'automatic'
};

/** Spanish abbreviations used in free-text effect parsing. */
export const RESISTANCE_TYPE_ABBREVIATIONS = Object.freeze({
  [ResistanceTypes.PHYSICAL]: 'RF',
  [ResistanceTypes.DISEASE]: 'RE',
  [ResistanceTypes.POISON]: 'RV',
  [ResistanceTypes.MAGIC]: 'RM',
  [ResistanceTypes.PSYCHIC]: 'RP'
});

/**
 * Fixed resistance check used by spell grades and psychic difficulties.
 * Invocation entity powers are the exception and use {@link createScalableResistanceCheck}.
 * @param {number} [value=0]
 * @returns {ResistanceCheckData}
 */
export function createFixedResistanceCheck(value = 0) {
  return createResistanceCheck({ scalable: false, value });
}

/**
 * Scalable resistance check used only by invocation entity powers.
 * @param {number} [value=0]
 * @returns {ResistanceCheckData}
 */
export function createScalableResistanceCheck(value = 0) {
  return createResistanceCheck({ scalable: true, value });
}

/**
 * @typedef {object} ResistanceCheckData
 * @property {number} value Base resistance difficulty
 * @property {{ amount: number, per: number }} [scale] Optional margin scaling (invocations only)
 * @property {string[]} types Selected resistance type keys
 * @property {string} selection {@link ResistanceSelectionModes}
 * @property {string} application {@link ResistanceApplicationModes}
 * @property {boolean} allowComposure Whether Frialdad (composure) may be added to the check
 */

/**
 * @param {{ scalable?: boolean, value?: number }} [options]
 * @returns {ResistanceCheckData}
 */
export function createResistanceCheck({ scalable = false, value = 0 } = {}) {
  const base = scalable
    ? createScalableStat(value)
    : { value: Number(value) || 0 };

  return {
    ...base,
    types: [],
    selection: ResistanceSelectionModes.HIGHEST,
    application: ResistanceApplicationModes.ON_HIT,
    allowComposure: false
  };
}

/**
 * Normalize legacy `{ value, type }` and partial objects into {@link ResistanceCheckData}.
 * @param {object | undefined | null} raw
 * @param {{ scalable?: boolean }} [options]
 * @returns {ResistanceCheckData}
 */
export function ensureResistanceCheck(raw, { scalable = false } = {}) {
  const source = raw && typeof raw === 'object' ? raw : {};

  /** @type {string[]} */
  let types = [];
  if (Array.isArray(source.types)) {
    types = source.types
      .map(t => String(t ?? '').trim())
      .filter(t => RESISTANCE_TYPE_KEYS.includes(t));
  } else if (source.type) {
    const single = String(source.type).trim();
    if (RESISTANCE_TYPE_KEYS.includes(single)) types = [single];
  }

  const selection =
    source.selection === ResistanceSelectionModes.LOWEST
      ? ResistanceSelectionModes.LOWEST
      : ResistanceSelectionModes.HIGHEST;

  const application =
    source.application === ResistanceApplicationModes.AUTOMATIC
      ? ResistanceApplicationModes.AUTOMATIC
      : ResistanceApplicationModes.ON_HIT;

  const allowComposure = !!source.allowComposure;

  if (scalable || source.scale) {
    const { value, scale } = ensureScalableStat(source);
    return { value, scale, types, selection, application, allowComposure };
  }

  const value =
    typeof source.value === 'number'
      ? source.value || 0
      : Number.parseFloat(String(source.value ?? '').replace(',', '.')) || 0;

  // Fixed checks never keep a scale blob (invocations are the only scalable case).
  return { value, types, selection, application, allowComposure };
}

/**
 * @param {ResistanceCheckData | object | undefined} check
 * @returns {boolean}
 */
export function isResistanceCheckActive(check) {
  const ensured = ensureResistanceCheck(check);
  return ensured.types.length > 0;
}

/**
 * Resolve difficulty (with optional margin scaling) and metadata for chat/combat.
 * @param {ResistanceCheckData | object | undefined} check
 * @param {number} [margin=0]
 * @returns {{
 *   active: boolean,
 *   difficulty: number,
 *   types: string[],
 *   selection: string,
 *   application: string,
 *   allowComposure: boolean
 * }}
 */
export function resolveResistanceCheck(check, margin = 0) {
  const ensured = ensureResistanceCheck(check, {
    scalable: !!(check && typeof check === 'object' && check.scale)
  });
  const difficulty =
    ensured.scale != null
      ? evaluateScalableStat(ensured, margin)
      : Number(ensured.value) || 0;

  return {
    active: ensured.types.length > 0,
    difficulty,
    types: [...ensured.types],
    selection: ensured.selection,
    application: ensured.application,
    allowComposure: ensured.allowComposure
  };
}

/**
 * Frialdad (composure) bonus vs emotional/supernatural effects — Anima Table 13.
 * @readonly
 */
export const COMPOSURE_BONUS_TABLE = Object.freeze([
  { min: 40, bonus: 5 },
  { min: 80, bonus: 10 },
  { min: 120, bonus: 15 },
  { min: 140, bonus: 20 },
  { min: 180, bonus: 25 },
  { min: 240, bonus: 30 },
  { min: 280, bonus: 35 },
  { min: 320, bonus: 40 }
]);

/**
 * @param {number} composureFinal Actor composure (Frialdad) final value
 * @returns {number}
 */
export function getComposureResistanceBonus(composureFinal) {
  const score = Number(composureFinal) || 0;
  let bonus = 0;
  for (const row of COMPOSURE_BONUS_TABLE) {
    if (score >= row.min) bonus = row.bonus;
  }
  return bonus;
}

/**
 * Flatten a resistance check for FormApplication / Handlebars templates.
 * Field names use the given prefix (default `resistance`).
 * @param {ResistanceCheckData | object | undefined} check
 * @param {{ prefix?: string, scalable?: boolean }} [options]
 */
export function resistanceCheckToFormFields(
  check,
  { prefix = 'resistance', scalable = false } = {}
) {
  const ensured = ensureResistanceCheck(check, { scalable });
  /** @type {Record<string, boolean>} */
  const typeChecks = {};
  for (const key of RESISTANCE_TYPE_KEYS) {
    typeChecks[key] = ensured.types.includes(key);
  }

  /** @type {Record<string, unknown>} */
  const fields = {
    [`${prefix}Types`]: typeChecks,
    [`${prefix}Selection`]: ensured.selection,
    [`${prefix}Application`]: ensured.application,
    [`${prefix}AllowComposure`]: ensured.allowComposure,
    [`${prefix}HasMultipleTypes`]: ensured.types.length > 1
  };

  if (scalable) {
    const { value, scale } = ensureScalableStat(ensured);
    fields[`${prefix}Difficulty`] = value;
    fields[`${prefix}DifficultyScaleAmount`] = scale.amount;
    fields[`${prefix}DifficultyScalePer`] = scale.per;
  } else {
    fields[`${prefix}Difficulty`] = ensured.value;
  }

  return fields;
}

/**
 * Read a resistance check from FormApplication form data.
 * @param {object} formData
 * @param {{ prefix?: string, scalable?: boolean }} [options]
 * @returns {ResistanceCheckData}
 */
export function resistanceCheckFromFormData(
  formData,
  { prefix = 'resistance', scalable = false } = {}
) {
  /** @type {string[]} */
  const types = [];
  for (const key of RESISTANCE_TYPE_KEYS) {
    const flag = formData[`${prefix}Type_${key}`];
    if (flag === 'on' || flag === true || flag === key) types.push(key);
  }

  // Also accept a single multi-value field `resistanceTypes`.
  const rawTypes = formData[`${prefix}Types`];
  if (rawTypes !== undefined) {
    const list = Array.isArray(rawTypes) ? rawTypes : [rawTypes];
    for (const t of list) {
      const key = String(t ?? '').trim();
      if (RESISTANCE_TYPE_KEYS.includes(key) && !types.includes(key)) types.push(key);
    }
  }

  const selection =
    formData[`${prefix}Selection`] === ResistanceSelectionModes.LOWEST
      ? ResistanceSelectionModes.LOWEST
      : ResistanceSelectionModes.HIGHEST;

  const application =
    formData[`${prefix}Application`] === ResistanceApplicationModes.AUTOMATIC
      ? ResistanceApplicationModes.AUTOMATIC
      : ResistanceApplicationModes.ON_HIT;

  const allowComposure =
    formData[`${prefix}AllowComposure`] === 'on' ||
    formData[`${prefix}AllowComposure`] === true;

  if (scalable) {
    const perRaw = Number(
      formData[`${prefix}DifficultyScalePer`] ?? DEFAULT_ENTITY_POWER_SCALE_PER
    );
    return {
      value: Number(formData[`${prefix}Difficulty`] ?? 0) || 0,
      scale: {
        amount: Number(formData[`${prefix}DifficultyScaleAmount`] ?? 0) || 0,
        per: perRaw > 0 ? perRaw : DEFAULT_ENTITY_POWER_SCALE_PER
      },
      types,
      selection,
      application,
      allowComposure
    };
  }

  return {
    value: Number(formData[`${prefix}Difficulty`] ?? 0) || 0,
    types,
    selection,
    application,
    allowComposure
  };
}

/**
 * Shared getData payload for dialogs that embed the resistance-check partial (fixed).
 * @param {object | undefined} resistanceEffect
 * @param {typeof import('../ABFConfig.js').ABFConfig} [config]
 */
export function resistanceCheckDialogData(resistanceEffect, config) {
  return {
    resistanceFieldPrefix: 'resistance',
    resistanceScalable: false,
    resistanceTypeOptions: config?.iterables?.resistances ?? {},
    resistanceSelectionModes: config?.iterables?.resistanceSelectionModes ?? {},
    resistanceApplicationModes: config?.iterables?.resistanceApplicationModes ?? {},
    ...resistanceCheckToFormFields(resistanceEffect, {
      prefix: 'resistance',
      scalable: false
    })
  };
}
