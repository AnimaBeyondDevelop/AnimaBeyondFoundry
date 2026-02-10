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
 * Normalize legacy NumericalValue shapes into current typed shape.
 * Supports:
 * - legacy: { value:number }
 * - legacy: { base:number, special:number, final:number } (numbers or {value})
 * - partial mixes
 */
function normalizeNumericalValueNode(node) {
  if (!node || typeof node !== 'object') return node;

  const out = { ...node };

  // legacy: { value } -> base.value
  if ('value' in out && !('base' in out)) {
    const base = toValueObj(out.value, 0);
    const special = toValueObj(0, 0);
    const final = toValueObj(base.value + special.value, base.value + special.value);
    delete out.value;

    return {
      ...out,
      base,
      special,
      final
    };
  }

  // typed/partial: coerce fields
  const base = toValueObj(out.base ?? 0, 0);
  const special = toValueObj(out.special ?? 0, 0);
  const final = toValueObj(
    out.final ?? base.value + special.value,
    base.value + special.value
  );

  // New fields (ensure types)
  const formula = typeof out.formula === 'string' ? out.formula : '';
  const calculateBaseFromFormula =
    typeof out.calculateBaseFromFormula === 'boolean'
      ? out.calculateBaseFromFormula
      : false;

  const normalized = {
    ...out,
    formula,
    calculateBaseFromFormula,
    base,
    special,
    final
  };

  delete normalized.value; // strip legacy if present
  return normalized;
}

/** @type {import('./Migration').Migration} */
export const MigrationXXMigrateTypedNumericalValues = {
  id: 'migration_migrate-typed-numerical-values',
  version: '2.2.0',
  order: 2,
  title: 'Migrate typed NumericalValue',
  description:
    'Normalizes NumericalValue nodes defined in the template (TYPED_PATHS) to the current typed shape (adds formula fields).',

  filterActors(actor) {
    for (const [path, type] of TYPED_PATHS.entries()) {
      if (type !== 'NumericalValue') continue;
      const rel = path.replace(/^system\./, '');
      if (foundry.utils.getProperty(actor.system, rel) != null) return true;
    }
    return false;
  },

  updateActor(actor) {
    const ctor = TypeRegistry.get('NumericalValue');
    if (!ctor) return actor;

    for (const [path, type] of TYPED_PATHS.entries()) {
      if (type !== 'NumericalValue') continue;

      const rel = path.replace(/^system\./, '');
      const current = foundry.utils.getProperty(actor.system, rel);
      if (!current || typeof current !== 'object') continue;

      // 1) normalize legacy shapes
      const normalizedLegacy = normalizeNumericalValueNode(current);

      // 2) template defaults (include overrides from __type in INITIAL_ACTOR_DATA)
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

      // 4) prune to current type shape
      ctor.pruneToDefaults(merged);

      foundry.utils.setProperty(actor.system, rel, merged);
    }

    Logger.log('Migrated NumericalValue nodes (template-driven).');
    return actor;
  }
};
