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
 * Maps an ActiveEffect mode to a write kind.
 * - OVERRIDE => overwrite
 * - others   => modify
 *
 * @param {number} mode
 * @returns {'overwrite'|'modify'}
 */
function writeKindFromAEMode(mode) {
  return mode === CONST.ACTIVE_EFFECT_MODES.OVERRIDE ? 'overwrite' : 'modify';
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
  const kind = writeKindFromAEMode(change.mode);

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
