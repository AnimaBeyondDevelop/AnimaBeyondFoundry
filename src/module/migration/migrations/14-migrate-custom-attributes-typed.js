import { Logger } from '../../../utils';

const TYPE_MARKER = '{"type":"CustomAttribute"}';

function sanitizeKey(name) {
  const normalized = String(name ?? '')
    .trim()
    .replaceAll('.', '_');

  return normalized || 'customAttribute';
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

function toTypedNode(raw, fallbackKey) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const system = src.system && typeof src.system === 'object' ? src.system : {};

  const dataType =
    src.dataType ??
    src.tipo ??
    system.dataType?.value ??
    system.tipo?.value ??
    'number';

  const numberDataRaw = src.numberData ?? system.numberData?.value ?? 0;
  const numberData = Number(numberDataRaw);

  return {
    __type: TYPE_MARKER,
    key: String(src.key ?? fallbackKey),
    dataType: ['string', 'bool', 'number'].includes(String(dataType))
      ? String(dataType)
      : 'number',
    stringData: String(src.stringData ?? system.stringData?.value ?? ''),
    boolData:
      src.boolData ?? system.boolData?.value ?? false
        ? true
        : false,
    numberData: Number.isFinite(numberData) ? numberData : 0
  };
}

function normalizeCustomAttributes(raw) {
  if (Array.isArray(raw)) {
    const out = {};

    for (const entry of raw) {
      const preferredName = String(entry?.name ?? '').trim();
      const key = uniqueKey(out, sanitizeKey(preferredName || 'customAttribute'));
      out[key] = toTypedNode(entry, key);
    }

    return out;
  }

  if (!raw || typeof raw !== 'object') return {};

  const out = {};
  for (const [key, value] of Object.entries(raw)) {
    out[key] = toTypedNode(value, key);
  }

  return out;
}

/** @type {import('./Migration').Migration} */
export const MigrationXXMigrateCustomAttributesToTypedNodes = {
  id: 'migration_migrate-custom-attributes-to-typed-nodes',
  version: '2.2.1',
  order: 3,
  title: 'Migrate custom attributes to typed nodes',
  description:
    'Converts legacy custom attributes (internal item shape/array) into typed nodes under system.effects.customAttributes.',

  filterActors(actor) {
    const effectsNode = actor.system?.effects?.customAttributes;
    const generalNode = actor.system?.general?.customAttributes;

    return Array.isArray(effectsNode) || Array.isArray(generalNode);
  },

  updateActor(actor) {
    const legacyEffects = actor.system?.effects?.customAttributes;
    const legacyGeneral = actor.system?.general?.customAttributes;

    const base =
      legacyEffects && !Array.isArray(legacyEffects)
        ? legacyEffects
        : legacyGeneral && !Array.isArray(legacyGeneral)
        ? legacyGeneral
        : {};

    const result = normalizeCustomAttributes(base);

    const appendFromArray = entries => {
      if (!Array.isArray(entries)) return;

      const normalized = normalizeCustomAttributes(entries);
      for (const [key, value] of Object.entries(normalized)) {
        const finalKey = uniqueKey(result, key);
        result[finalKey] = { ...value, key: finalKey };
      }
    };

    appendFromArray(legacyEffects);
    appendFromArray(legacyGeneral);

    actor.system.effects = actor.system.effects ?? {};
    actor.system.effects.customAttributes = result;

    if (actor.system.general && 'customAttributes' in actor.system.general) {
      delete actor.system.general.customAttributes;
    }

    Logger.log('Migrated customAttributes to typed nodes.');
    return actor;
  }
};

