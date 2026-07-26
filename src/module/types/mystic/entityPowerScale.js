/**
 * Scaling for entity power stats based on how much the summon roll beats the difficulty.
 * Pattern: base + floor(margin / per) * amount
 */

/** @readonly */
export const DEFAULT_ENTITY_POWER_SCALE_PER = 10;

/**
 * Numeric entity-power fields that support margin scaling.
 * @readonly
 * @type {readonly string[]}
 */
export const ENTITY_POWER_SCALABLE_STATS = Object.freeze([
  'attackAbility',
  'defenseAbility',
  'damage',
  'area',
  'reducedArmor',
  'critBonus',
  'shieldPoints'
]);

/**
 * @param {number} [value=0]
 * @returns {{ value: number, scale: { amount: number, per: number } }}
 */
export function createScalableStat(value = 0) {
  return {
    value: Number(value) || 0,
    scale: {
      amount: 0,
      per: DEFAULT_ENTITY_POWER_SCALE_PER
    }
  };
}

/**
 * Ensure a stat has the scalable shape without wiping existing data.
 * @param {{ value?: unknown, scale?: { amount?: unknown, per?: unknown } } | undefined} stat
 * @returns {{ value: number, scale: { amount: number, per: number } }}
 */
export function ensureScalableStat(stat) {
  const raw = stat?.value;
  const value =
    typeof raw === 'number'
      ? raw || 0
      : Number.parseFloat(String(raw ?? '').replace(',', '.')) || 0;
  const amount = Number(stat?.scale?.amount ?? 0) || 0;
  const perRaw = Number(stat?.scale?.per ?? DEFAULT_ENTITY_POWER_SCALE_PER);
  const per = perRaw > 0 ? perRaw : DEFAULT_ENTITY_POWER_SCALE_PER;

  return {
    value,
    scale: { amount, per }
  };
}

/**
 * @param {{ value?: unknown, scale?: { amount?: unknown, per?: unknown } } | undefined} stat
 * @param {number} margin Points by which the summon roll exceeds the difficulty (min 0)
 * @returns {number}
 */
export function evaluateScalableStat(stat, margin) {
  const { value, scale } = ensureScalableStat(stat);
  const safeMargin = Math.max(0, Number(margin) || 0);
  if (!scale.amount || !scale.per || safeMargin <= 0) return value;
  return value + Math.floor(safeMargin / scale.per) * scale.amount;
}

/**
 * @param {{ value?: unknown, scale?: { amount?: unknown, per?: unknown } } | undefined} stat
 * @param {number} margin
 * @returns {{ base: number, bonus: number, final: number }}
 */
export function resolveScalableStatBreakdown(stat, margin) {
  const { value: base } = ensureScalableStat(stat);
  const final = evaluateScalableStat(stat, margin);
  return { base, bonus: final - base, final };
}

/**
 * Display string: `final (base + bonus)` when a margin bonus applies, otherwise just `final`.
 * @param {{ value?: unknown, scale?: { amount?: unknown, per?: unknown } } | undefined} stat
 * @param {number} margin
 * @returns {string}
 */
export function formatScalableStatBreakdown(stat, margin) {
  const { base, bonus, final } = resolveScalableStatBreakdown(stat, margin);
  if (!bonus) return String(final);
  return `${final} (${base} + ${bonus})`;
}

/**
 * @param {object} system Entity power system data
 * @param {number} margin
 * @returns {Record<string, number>}
 */
export function resolveEntityPowerScaledStats(system, margin) {
  /** @type {Record<string, number>} */
  const out = {};
  for (const key of ENTITY_POWER_SCALABLE_STATS) {
    out[key] = evaluateScalableStat(system?.[key], margin);
  }
  return out;
}
