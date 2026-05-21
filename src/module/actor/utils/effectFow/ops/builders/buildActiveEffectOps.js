/* eslint-disable no-continue */
import { applySingleActiveEffectChange } from '../../applicators/activeEffectApplicator.js';
import { normalizePaths } from '../normalizePaths.js';

function inferDepsFromChangeValue(value) {
  if (typeof value !== 'string') return [];
  const out = [];
  const re = /@([a-zA-Z0-9_.]+)/g;

  let m;
  while ((m = re.exec(value)) !== null) {
    const raw = m[1];
    out.push(raw.startsWith('system.') ? raw : `system.${raw}`);
  }
  return [...new Set(out)];
}

function getFlaggedDeps(effect, index) {
  const depsByIndex = effect.getFlag?.('animabf', 'flowChangeDeps') ?? [];
  const deps = depsByIndex?.[index];
  return Array.isArray(deps) ? deps : [];
}

/**
 * Maps an ActiveEffect change mode to a write kind.
 *
 * Tolerates both formats:
 *  - legacy custom string mode in `change.type` (e.g. "override", "add"),
 *    which is what items effect store in `system.effectData.changes` and what
 *    the in-system custom flow has historically produced.
 *  - Foundry-standard numeric mode in `change.mode`, used by any AE that
 *    passes through Foundry's EffectChangeData schema (every AE created via
 *    Foundry's native UI, or after schema normalization). OVERRIDE = 5 per
 *    CONST.ACTIVE_EFFECT_MODES.
 *
 * @param {{type?: string, mode?: number}} change
 * @returns {'overwrite'|'modify'}
 */
function writeKindFromAEMode(change) {
  if (change?.type === 'override') return 'overwrite';
  if (change?.mode === 5) return 'overwrite'; // CONST.ACTIVE_EFFECT_MODES.OVERRIDE
  return 'modify';
}

/**
 * Crea un FlowOp de un change concreto.
 *
 * @param {any} effect
 * @param {number} index
 * @param {{key:string, mode:number, value:any}} change
 */
export function buildActiveEffectChangeOp(effect, index, change) {
  const flagged = getFlaggedDeps(effect, index);
  const inferred = flagged.length > 0 ? [] : inferDepsFromChangeValue(change.value);

  const deps = normalizePaths([...flagged, ...inferred]);

  const [path] = normalizePaths([change.key]);
  const kind = writeKindFromAEMode(change);

  return {
    id: `ae:${effect.id}:${index}`,
    deps,
    writes: [{ path, kind }],
    _tie: {
      priority: Number(effect.priority ?? 0),
      effectId: String(effect.id),
      index
    },
    apply: actor => applySingleActiveEffectChange(actor, effect, change)
  };
}

/**
 * Devuelve una lista plana de ops (1 por change).
 *
 * @param {any} actor
 */
export function buildActiveEffectChangeOps(actor) {
  const ops = [];

  for (const effect of actor.effects?.contents ?? []) {
    if (!effect.active) continue;

    // Foundry's ActiveEffect stores changes at the top-level `effect.changes`
    // (see EffectChangeData schema). The previous reading of
    // `effect.system.changes` was always empty/undefined because Foundry does
    // not place changes under the system data; that single line silently broke
    // every Active Effect in the system (Sangre de Orochi, Ceguera, Derribado,
    // ...) - they appeared active on the token but their changes were never
    // applied.
    const changes = effect.changes;
    if (!Array.isArray(changes) || changes.length === 0) continue;

    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      if (!change?.key) continue;
      ops.push(buildActiveEffectChangeOp(effect, i, change));
    }
  }

  return ops;
}
