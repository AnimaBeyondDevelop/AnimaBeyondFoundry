import { TYPED_PATHS, TYPED_DEFAULTS } from '../../actor/types/typedTemplateIndex.js';
import { TypeRegistry } from '../../actor/types/TypeRegistry.js';

/**
 * Coerce {value} object; if number -> {value:number}
 * @param {any} node
 * @param {number} fallback
 */
function toValueObj(node, fallback = 0) {
  if (node && typeof node === 'object' && 'value' in node) {
    return { value: Number(node.value) || 0 };
  }
  return { value: Number(node) || fallback };
}

/**
 * Normalize legacy shapes into typed Characteristic shape.
 * - legacy: { value:number, mod:number }
 * - legacy: { base:number, special:number, final:number, mod:number }
 * - partial: mixes of numbers and {value}
 */
function normalizeCharacteristicNode(node) {
  if (!node || typeof node !== 'object') return node;

  // legacy: { value, mod }
  if ('value' in node && !('base' in node)) {
    const base = toValueObj(node.value, 0);
    const special = toValueObj(0, 0);
    const final = toValueObj(base.value + special.value, 0);
    const mod = toValueObj(node.mod ?? 0, 0);
    return { ...node, base, special, final, mod };
  }

  // typed/partial: coerce fields
  const base = toValueObj(node.base ?? 0, 0);
  const special = toValueObj(node.special ?? 0, 0);
  const final = toValueObj(
    node.final ?? base.value + special.value,
    base.value + special.value
  );
  const mod = toValueObj(node.mod ?? 0, 0);

  const out = { ...node, base, special, final, mod };
  delete out.value; // strip legacy
  return out;
}

/** @type {import('./Migration').Migration} */
export const MigrationXXMigrateTypedCharacteristics = {
  id: 'migration_migrate-typed-characteristics',
  version: '2.2.0',
  order: 1,
  title: 'Migrate typed characteristics',
  description:
    'Normalizes Characteristic nodes defined in the template (TYPED_PATHS) to the current typed shape.',

  filterActors(actor) {
    for (const [path, type] of TYPED_PATHS.entries()) {
      if (type !== 'Characteristic') continue;
      const rel = path.replace(/^system\./, '');
      if (foundry.utils.getProperty(actor.system, rel) != null) return true;
    }
    return false;
  },

  /**
   * Applies partial system patches inline and returns false so migrate.js
   * does not rewrite the full actor system (expensive on large worlds).
   * @param {import('../../actor/ABFActor').ABFActor} actor
   * @param {{ pack?: string }} context
   */
  async updateActor(actor, context = {}) {
    const ctor = TypeRegistry.get('Characteristic');
    if (!ctor) return false;

    /** @type {Record<string, object>} */
    const changes = {};

    for (const [path, type] of TYPED_PATHS.entries()) {
      if (type !== 'Characteristic') continue;

      const rel = path.replace(/^system\./, '');
      const current = foundry.utils.getProperty(actor.system, rel);
      if (!current || typeof current !== 'object') continue;

      const normalizedLegacy = normalizeCharacteristicNode(current);
      const def = TYPED_DEFAULTS.get(path) ?? ctor.defaults();
      const merged = foundry.utils.mergeObject(def, normalizedLegacy, {
        inplace: false,
        insertKeys: true,
        insertValues: true,
        overwrite: true
      });

      delete merged.__type;
      ctor.pruneToDefaults(merged);
      changes[`system.${rel}`] = merged;
    }

    if (!Object.keys(changes).length) return false;

    await actor.update(changes, { render: false, ...context });
    return false;
  }
};
