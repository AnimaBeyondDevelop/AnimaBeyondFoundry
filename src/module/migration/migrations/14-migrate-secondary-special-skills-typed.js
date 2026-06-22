import { TypeRegistry } from '../../actor/types/TypeRegistry.js';

const TYPE_MARKER = '{"type":"SecondaryAbility","attribute":"intelligence"}';

function sanitizeKey(name) {
  const normalized = String(name ?? '')
    .trim()
    .replaceAll('.', '_');

  return normalized || 'secondarySpecialSkill';
}

function uniqueKey(map, baseKey) {
  let candidate = baseKey;
  let i = 2;

  while (Object.prototype.hasOwnProperty.call(map, candidate)) {
    candidate = `${baseKey}_${i}`;
    i += 1;
  }

  return candidate;
}

function toValueObj(node, fallback = 0) {
  if (node && typeof node === 'object' && 'value' in node) {
    return { value: Number(node.value) || 0 };
  }
  return { value: Number(node) || fallback };
}

function legacyItemToTypedNode(item, key) {
  const level = Number(item?.system?.level?.value ?? item?.system?.level ?? 0) || 0;

  return {
    __type: TYPE_MARKER,
    key,
    attribute: 'intelligence',
    base: toValueObj(level, 0),
    special: toValueObj(0, 0)
  };
}

function normalizeLegacyCollection(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const out = {};

  for (const item of raw) {
    const preferredName = String(item?.name ?? '').trim();
    const key = uniqueKey(out, sanitizeKey(preferredName || 'secondarySpecialSkill'));
    out[key] = legacyItemToTypedNode(item, key);
  }

  return out;
}

/** @type {import('./Migration').Migration} */
export const MigrationXXMigrateSecondarySpecialSkillsTyped = {
  id: 'migration_migrate-secondary-special-skills-typed',
  version: '2.2.2',
  order: 3,
  title: 'Migrate secondary special skills to typed SecondaryAbility nodes',
  description:
    'Converts legacy secondary special skills (embedded items array) into typed SecondaryAbility nodes stored as a map, matching custom attributes.',

  filterActors(actor) {
    return Array.isArray(actor.system?.secondaries?.secondarySpecialSkills);
  },

  /**
   * @param {import('../../actor/ABFActor').ABFActor} actor
   * @param {{ pack?: string }} context
   */
  async updateActor(actor, context = {}) {
    const raw = actor.system?.secondaries?.secondarySpecialSkills;
    if (!Array.isArray(raw)) return false;

    const converted = normalizeLegacyCollection(raw) ?? {};

    const ctor = TypeRegistry.get('SecondaryAbility');
    if (!ctor) return false;

    /** @type {Record<string, object>} */
    const normalized = {};

    for (const [key, node] of Object.entries(converted)) {
      const def = ctor.defaults();
      const merged = foundry.utils.mergeObject(def, node, {
        inplace: false,
        insertKeys: true,
        insertValues: true,
        overwrite: true
      });

      delete merged.__type;
      ctor.pruneToDefaults(merged);
      normalized[key] = {
        __type: TYPE_MARKER,
        ...merged,
        key
      };
    }

    await actor.update(
      {
        'system.secondaries.secondarySpecialSkills': normalized
      },
      { render: false, ...context }
    );

    return false;
  }
};
