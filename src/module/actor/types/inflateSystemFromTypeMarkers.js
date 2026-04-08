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

/**
 * Walks a plain-object tree and inflates any nodes that carry a `__type` marker
 * (as serialised by `deflateSystemToTypeMarkers`).
 *
 * Two safety guards are applied during the walk:
 * - A `WeakSet` tracks visited objects to prevent infinite recursion on circular
 *   references present in Foundry's live document graph (e.g. `EmbeddedCollection`).
 * - Assignments are skipped when the value is unchanged, and silently ignored when
 *   the property is read-only (e.g. `EmbeddedCollection#documentClass`).
 *
 * @param {object} root - The system data object to inflate in-place.
 * @returns {object} The same `root` object, with type-marker nodes replaced.
 */
export function inflateSystemFromTypeMarkers(root) {
  ensureTypesRegistered();

  const seen = new WeakSet();

  const walk = obj => {
    if (!obj || typeof obj !== 'object') return obj;
    if (seen.has(obj)) return obj;
    seen.add(obj);

    if (typeof obj.__type === 'string') {
      // Inflate and continue walking in case nested markers exist
      return walk(inflateNode(obj));
    }

    for (const [k, v] of Object.entries(obj)) {
      const walked = walk(v);
      if (walked !== v) {
        try { obj[k] = walked; } catch { /* read-only property, skip */ }
      }
    }
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
