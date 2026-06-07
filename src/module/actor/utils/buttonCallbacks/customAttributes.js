import { openSimpleInputDialog } from '../../../utils/dialogs/openSimpleInputDialog.js';

const TYPE_MARKER = '{"type":"CustomAttribute"}';

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

export async function addCustomAttribute(sheet) {
  const name = await openSimpleInputDialog({
    content: game.i18n.localize('dialogs.items.customAttribute.content')
  });

  const cleanName = String(name ?? '').trim();
  if (!cleanName) return;

  const existing = normalizeCustomAttributes(sheet.actor.system.effects?.customAttributes);
  const key = uniqueKey(existing, sanitizeKey(cleanName));

  existing[key] = {
    __type: TYPE_MARKER,
    key,
    dataType: 'number',
    stringData: '',
    boolData: false,
    numberData: 0
  };

  await sheet.actor.update({ 'system.effects.customAttributes': existing });
}

addCustomAttribute.action = 'add-custom-attribute';

export async function deleteCustomAttribute(sheet, event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();

  const actor = sheet?.actor;
  if (!actor) return;

  const key = String(event?.currentTarget?.dataset?.customAttributeKey ?? '').trim();
  if (!key) return;

  await sheet?._flushPendingSheetUpdatesImmediately?.();

  await actor.update(
      {
        [`system.effects.customAttributes.${key}`]: null
      },
      {
        unset: true
      }
  );

  sheet.render?.(false);
}

deleteCustomAttribute.action = 'delete-custom-attribute';

