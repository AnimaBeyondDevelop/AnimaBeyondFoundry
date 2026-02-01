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

function inflateNode(node) {
  const marker = parseTypeMarker(node.__type);
  if (!marker) return node;

  const { type, ...overrides } = marker;

  const ctor = TypeRegistry.get(type);
  if (!ctor) throw new Error(`Unknown type: ${type}`);

  const { __type, ...rest } = node;

  const out = ctor.inflate(overrides, rest);

  return out;
}

export function inflateSystemFromTypeMarkers(root) {
  ensureTypesRegistered();

  const walk = obj => {
    if (!obj || typeof obj !== 'object') return obj;

    if (typeof obj.__type === 'string') {
      // Inflate and continue walking in case nested markers exist
      return walk(inflateNode(obj));
    }

    for (const [k, v] of Object.entries(obj)) obj[k] = walk(v);
    return obj;
  };

  return walk(root);
}

function ensureTypesRegistered() {
  if (TypeRegistry.size === 0) {
    throw new Error(
      '[ABF] TypeRegistry is empty. typeRegistryLoader.js was not executed.'
    );
  }
}
