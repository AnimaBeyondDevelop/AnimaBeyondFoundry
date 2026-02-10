import { Logger } from '../../../utils';
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

  updateActor(actor) {
    const ctor = TypeRegistry.get('Characteristic');
    if (!ctor) return actor;

    for (const [path, type] of TYPED_PATHS.entries()) {
      if (type !== 'Characteristic') continue;

      const rel = path.replace(/^system\./, '');
      const current = foundry.utils.getProperty(actor.system, rel);
      if (!current || typeof current !== 'object') continue;

      // 1) normalize legacy shapes (numbers -> {value}, "value" legacy field, etc.)
      const normalizedLegacy = normalizeCharacteristicNode(current);

      // 2) template defaults (already include overrides from __type in INITIAL_ACTOR_DATA)
      const def = TYPED_DEFAULTS.get(path) ?? ctor.defaults();

      // 3) merge defaults + normalized data (data wins)
      const merged = foundry.utils.mergeObject(def, normalizedLegacy, {
        inplace: false,
        insertKeys: true,
        insertValues: true,
        overwrite: true
      });

      // Ensure we never keep the marker in persisted data for template nodes
      delete merged.__type;

      // 4) prune to the current type shape (drops any unknown keys)
      ctor.pruneToDefaults(merged);

      foundry.utils.setProperty(actor.system, rel, merged);
    }

    Logger.log('Migrated Characteristic nodes (template-driven).');
    return actor;
  }
};
