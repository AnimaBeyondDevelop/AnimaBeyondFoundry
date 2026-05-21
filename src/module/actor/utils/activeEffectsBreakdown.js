// /module/actor/utils/activeEffectsBreakdown.js
import { ATTRIBUTE_DERIVATION_MAP } from './attributeDerivationMap.js';

/**
 * Normalize an Active Effect change to a logical mode string. Kept in sync
 * with the resolver in activeEffectApplicator.js so the trace and the actual
 * applied effect always agree on what each change does.
 */
function normalizeChangeMode(change) {
  if (typeof change?.type === 'string') return change.type;
  switch (change?.mode) {
    case 1: return 'multiply';
    case 2: return 'add';
    case 3: return 'override';
    case 4: return 'override';
    case 5: return 'override';
    default: return 'add';
  }
}

function getProp(obj, path) {
  if (!obj || !path) return undefined;
  const keys = path.split('.');
  let cur = obj;
  for (const k of keys) {
    if (cur == null) return undefined;
    cur = cur[k];
  }
  return cur;
}

/**
 * @typedef {Object} BreakdownItem
 * @property {string} effectId
 * @property {string} effectName
 * @property {string} path          The change.key (which path the AE touches)
 * @property {'add'|'multiply'|'override'} mode
 * @property {number|string} value
 * @property {boolean} isLinear     true when mode is 'add' and value is numeric
 */

/**
 * @typedef {Object} Breakdown
 * @property {number} total         Sum of linear contributions (for backward compat)
 * @property {number} linearTotal   Same as total — kept for backward compat
 * @property {boolean} hasNonLinear true if any contribution is multiply/override
 * @property {BreakdownItem[]} items
 */

/**
 * Iterate the active AE on an actor and collect every change whose key
 * matches any of the `paths`. Each match becomes a BreakdownItem.
 *
 * The helper is path-set based on purpose: a single roll attribute (Ataque,
 * Parada, Proyección mágica...) is derived from several paths in the system
 * (the final value plus the modifiers that flow into it), and a relevant AE
 * is one that touches ANY of them. By passing the full path set we surface
 * indirect contributors (e.g. Ceguera parcial penalizing physicalActions
 * shows up under Ataque too).
 *
 * @param {object} actor
 * @param {string[]} paths
 * @returns {Breakdown}
 */
export function getActiveEffectsBreakdownForPaths(actor, paths) {
  const items = [];
  let linearTotal = 0;
  let hasNonLinear = false;

  const pathSet = new Set(paths ?? []);
  if (pathSet.size === 0) {
    return { total: 0, linearTotal: 0, hasNonLinear: false, items };
  }

  const effects = actor?.effects?.contents ?? [];
  for (const effect of effects) {
    if (!effect.active) continue;

    const changes = effect.changes;
    if (!Array.isArray(changes) || changes.length === 0) continue;

    for (const change of changes) {
      if (!change?.key || !pathSet.has(change.key)) continue;

      const mode = normalizeChangeMode(change);
      const numeric = Number(change.value);
      const value = Number.isNaN(numeric) ? change.value : numeric;
      const isLinear = mode === 'add' && typeof value === 'number';

      items.push({
        effectId: String(effect.id ?? ''),
        effectName: String(effect.name ?? effect.label ?? '?'),
        path: change.key,
        mode,
        value,
        isLinear
      });

      if (isLinear) linearTotal += value;
      else hasNonLinear = true;
    }
  }

  return { total: linearTotal, linearTotal, hasNonLinear, items };
}

/**
 * Convenience wrapper: collect AE that affect a given roll attribute (one
 * of the keys in ATTRIBUTE_DERIVATION_MAP). Resolves the contributing paths
 * automatically.
 *
 * @param {object} actor
 * @param {string} attributeName  e.g. 'attack', 'block', 'magicProjectionOffensive'
 * @returns {Breakdown}
 */
export function getActiveEffectsBreakdownForAttribute(actor, attributeName) {
  const paths = ATTRIBUTE_DERIVATION_MAP[attributeName];
  if (!paths) {
    return { total: 0, linearTotal: 0, hasNonLinear: false, items: [] };
  }
  return getActiveEffectsBreakdownForPaths(actor, paths);
}

/**
 * Legacy API: collect AE that target exactly one path. Kept so existing
 * callers (CombatAttackDialog, AttackConfigurationDialog) keep working
 * during the migration to the attribute-based API. Internally delegates to
 * the paths helper with a single-element list, and additionally computes a
 * source-diff `total` so consumers can audit the AE flow result.
 *
 * @param {object} actor
 * @param {string} path
 * @returns {Breakdown}
 */
export function getActiveEffectsBreakdownForPath(actor, path) {
  const result = getActiveEffectsBreakdownForPaths(actor, [path]);

  // Maintain the previous semantics for `total` on single-path queries:
  // actor diff (post-AE current value vs source value).
  const currentRaw = getProp(actor, path);
  const sourcePath = path.startsWith('system.') ? path.slice('system.'.length) : path;
  const sourceRaw = getProp(actor?._source?.system, sourcePath);
  const current = Number(currentRaw) || 0;
  const source = Number(sourceRaw) || 0;
  return { ...result, total: current - source };
}
