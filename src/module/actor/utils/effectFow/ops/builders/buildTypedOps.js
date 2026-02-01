import { normalizePaths } from '../normalizePaths.js';
import { applyTypedDerivedSpec } from '../../applicators/typedDerivedApplicator.js';

function abs(base, rel) {
  return `${base}.${rel}`;
}

export function buildTypedOps(actor) {
  const ops = [];
  const typedNodes = actor.typedNodes;
  if (!typedNodes) return ops;

  for (const node of typedNodes.values()) {
    const basePath = node.systemPath;
    const specs = node.getDerivedFlowSpecs?.() ?? [];

    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];

      const depsAbs = normalizePaths(spec.deps.map(p => abs(basePath, p)));
      const modsAbs = normalizePaths(spec.mods.map(p => abs(basePath, p)));

      const kind = spec.kind ?? 'overwrite';
      const writes = modsAbs.map(path => ({ path, kind }));

      ops.push({
        id: `typed:${basePath}:${spec.id ?? i}`,
        deps: depsAbs,
        writes,
        apply: actor2 =>
          applyTypedDerivedSpec(actor2, {
            depsAbs,
            writes,
            compute: spec.compute
          })
      });
    }
  }

  return ops;
}
