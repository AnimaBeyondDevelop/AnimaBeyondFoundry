import { openSimpleInputDialog } from '../../../utils/dialogs/openSimpleInputDialog.js';

const TYPE_MARKER = '{"type":"SecondaryAbility","attribute":"intelligence"}';

function toTypedNode(raw, fallbackKey) {
  const src = raw && typeof raw === 'object' ? raw : {};

  return {
    __type: TYPE_MARKER,
    key: String(src.key ?? fallbackKey),
    attribute: String(src.attribute ?? 'intelligence'),
    base: { value: Number(src.base?.value ?? src.base ?? 0) || 0 },
    special: { value: Number(src.special?.value ?? src.special ?? 0) || 0 }
  };
}

function normalizeSecondarySpecialSkills(raw) {
  if (Array.isArray(raw)) return {};

  if (!raw || typeof raw !== 'object') return {};

  const out = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value == null) continue;
    out[key] = toTypedNode(value, key);
  }

  return out;
}

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

export async function addSecondarySpecialSkill(sheet) {
  const name = await openSimpleInputDialog({
    content: game.i18n.localize('dialogs.items.secondarySkill.content')
  });

  const cleanName = String(name ?? '').trim();
  if (!cleanName) return;

  const existing = normalizeSecondarySpecialSkills(
    sheet.actor.system.secondaries?.secondarySpecialSkills
  );
  const key = uniqueKey(existing, sanitizeKey(cleanName));

  existing[key] = {
    __type: TYPE_MARKER,
    key,
    attribute: 'intelligence',
    base: { value: 0 },
    special: { value: 0 }
  };

  await sheet.actor.update({ 'system.secondaries.secondarySpecialSkills': existing });
}

addSecondarySpecialSkill.action = 'add-secondary-special-skill';

const SECONDARY_SPECIAL_SKILL_PATH_PREFIX = 'system.secondaries.secondarySpecialSkills.';

function secondarySpecialSkillKeyFromPath(path) {
  const normalized = String(path ?? '');
  if (!normalized.startsWith(SECONDARY_SPECIAL_SKILL_PATH_PREFIX)) return '';
  return normalized.slice(SECONDARY_SPECIAL_SKILL_PATH_PREFIX.length);
}

export async function deleteSecondarySpecialSkill(sheet, eventOrTarget) {
  eventOrTarget?.preventDefault?.();
  eventOrTarget?.stopPropagation?.();

  const actor = sheet?.actor;
  if (!actor) return;

  const el = eventOrTarget?.currentTarget ?? eventOrTarget;
  const key =
    String(el?.dataset?.secondarySpecialSkillKey ?? '').trim() ||
    secondarySpecialSkillKeyFromPath(el?.dataset?.path);
  if (!key) return;

  await sheet?._flushPendingSheetUpdatesImmediately?.();

  await actor.update(
    {
      [`system.secondaries.secondarySpecialSkills.${key}`]: null
    },
    {
      unset: true
    }
  );

  sheet.render?.(false);
}
