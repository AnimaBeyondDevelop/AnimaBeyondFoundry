// /module/actor/utils/activeEffectsBreakdown.js

/**
 * Normalize an Active Effect change to a logical mode string.
 * Kept in sync with the resolver in activeEffectApplicator.js — we cannot
 * import from inside the effectFow folder here because this helper is
 * consumed from UI/dialog code that should not depend on the full effect
 * flow machinery.
 */
function normalizeChangeMode(change) {
  if (typeof change?.type === 'string') return change.type;
  switch (change?.mode) {
    case 1: return 'multiply';
    case 2: return 'add';
    case 3: return 'override'; // DOWNGRADE -> treated as override
    case 4: return 'override'; // UPGRADE   -> treated as override
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
 * Inspect the active Active Effects on an actor and return a structured
 * breakdown of every change that targets a specific data path (e.g.
 * 'system.combat.attack.final.value').
 *
 * Used by the combat dialog and the chat-attack template to show which AE
 * contributed how much to a given roll. Restores the traceability that was
 * lost when AE started writing directly to *.final.value.
 *
 * @param {object} actor  Foundry actor. Reads `actor.effects.contents`,
 *                        `actor` itself for the current value (post-AE) and
 *                        `actor._source.system` for the pre-AE source value.
 * @param {string} path   Dot-path to inspect, must start with 'system.'.
 *                        E.g. 'system.combat.attack.final.value'.
 * @returns {{
 *   total: number,
 *   linearTotal: number,
 *   hasNonLinear: boolean,
 *   items: Array<{
 *     effectId: string,
 *     effectName: string,
 *     mode: 'add'|'multiply'|'override',
 *     value: number|string,
 *     isLinear: boolean
 *   }>
 * }}
 */
export function getActiveEffectsBreakdownForPath(actor, path) {
  const items = [];
  let linearTotal = 0;
  let hasNonLinear = false;

  const effects = actor?.effects?.contents ?? [];
  for (const effect of effects) {
    if (!effect.active) continue;

    const changes = effect.changes;
    if (!Array.isArray(changes) || changes.length === 0) continue;

    for (const change of changes) {
      if (change?.key !== path) continue;

      const mode = normalizeChangeMode(change);
      const numeric = Number(change.value);
      const value = Number.isNaN(numeric) ? change.value : numeric;
      const isLinear = mode === 'add' && typeof value === 'number';

      items.push({
        effectId: String(effect.id ?? ''),
        effectName: String(effect.name ?? effect.label ?? '?'),
        mode,
        value,
        isLinear
      });

      if (isLinear) {
        linearTotal += value;
      } else {
        hasNonLinear = true;
      }
    }
  }

  // Authoritative total = current value (with AE applied) minus the source
  // value (before AE). This is the diff the AE flow actually produced and is
  // robust against any future code that also writes to the path.
  const currentRaw = getProp(actor, path);
  const sourcePath = path.startsWith('system.') ? path.slice('system.'.length) : path;
  const sourceRaw = getProp(actor?._source?.system, sourcePath);

  const current = Number(currentRaw) || 0;
  const source = Number(sourceRaw) || 0;
  const total = current - source;

  return { total, linearTotal, hasNonLinear, items };
}
