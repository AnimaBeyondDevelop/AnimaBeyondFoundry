import { applyDerived } from '../../applicators/derivedApplicator.js';
import { normalizePaths } from '../normalizePaths.js';

function normalizeDerivedMeta(fn, idx) {
  const flow = fn.abfFlow ?? {};
  const deps = normalizePaths(Array.isArray(flow.deps) ? flow.deps : []);
  const mods = normalizePaths(Array.isArray(flow.mods) ? flow.mods : []);

  return {
    id: `derived:${fn.name || idx}`,
    deps,
    mods
  };
}

export function buildDerivedOps(derivedFns) {
  return (derivedFns ?? []).map((fn, idx) => {
    const meta = normalizeDerivedMeta(fn, idx);

    return {
      id: meta.id,
      deps: meta.deps,
      writes: meta.mods.map(path => ({ path, kind: 'overwrite' })),
      apply: actor => applyDerived(actor, fn)
    };
  });
}
