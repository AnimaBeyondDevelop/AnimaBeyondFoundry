import { TypeRegistry } from './TypeRegistry.js';

function parseTypeMarker(str) {
  try {
    const obj = JSON.parse(str);
    if (!obj || typeof obj.type !== 'string') return null;
    return obj; // { type, ...overrides }
  } catch {
    return null;
  }
}

export function collectTypedFromTemplate(
  root,
  basePath = 'system',
  typedPaths = new Map(),
  typedDefaults = new Map()
) {
  if (!root || typeof root !== 'object') return { typedPaths, typedDefaults };

  if (typeof root.__type === 'string') {
    const marker = parseTypeMarker(root.__type);
    if (marker) {
      const { type, ...overrides } = marker;

      typedPaths.set(basePath, type);

      const baseDefaults = TypeRegistry.defaultsFor(type);
      const merged = foundry.utils.mergeObject(baseDefaults, overrides, {
        inplace: false,
        insertKeys: true,
        insertValues: true
      });

      typedDefaults.set(basePath, merged);
    }
  }

  for (const [k, v] of Object.entries(root)) {
    if (k === '__type') continue;
    collectTypedFromTemplate(v, `${basePath}.${k}`, typedPaths, typedDefaults);
  }

  return { typedPaths, typedDefaults };
}
