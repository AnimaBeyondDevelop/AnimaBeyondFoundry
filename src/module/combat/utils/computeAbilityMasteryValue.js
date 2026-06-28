const MASTERY_THRESHOLD = 200;

function resolveSystemPath(systemPathOrNode) {
  if (systemPathOrNode && typeof systemPathOrNode === 'object') {
    return String(systemPathOrNode.systemPath ?? '');
  }
  return String(systemPathOrNode ?? '');
}

function resolveTypedNode(actor, systemPathOrNode) {
  if (systemPathOrNode && typeof systemPathOrNode === 'object' && systemPathOrNode.systemPath) {
    return systemPathOrNode;
  }

  const systemPath = resolveSystemPath(systemPathOrNode);
  return systemPath ? actor?.typedNodes?.get(systemPath) ?? null : null;
}

function parseTypeMarkerAttribute(actor, systemPath) {
  const markerStr = foundry.utils.getProperty(actor, `${systemPath}.__type`);
  if (typeof markerStr !== 'string') return null;

  try {
    const marker = JSON.parse(markerStr);
    return typeof marker?.attribute === 'string' ? marker.attribute : null;
  } catch {
    return null;
  }
}

function getRelatedCharacteristicDelta(actor, systemPath, node) {
  if (node && typeof node._computeCharacteristicDelta === 'function') {
    return Number(node._computeCharacteristicDelta()) || 0;
  }

  const attribute = node?.attribute ?? parseTypeMarkerAttribute(actor, systemPath);
  if (!attribute) return 0;

  if (node && node.computeCharacteristicMod === false) return 0;

  const ch = actor?.system?.characteristics?.primaries?.[attribute];
  return Number(ch?.delta?.value ?? 0);
}

/**
 * Mastery threshold value for a typed ability:
 * base skill value plus the delta of its related characteristic.
 *
 * @param {import('../../actor/ABFActor.js').ABFActor} actor
 * @param {string|import('../../actor/types/concreteTypes/Ability.js').Ability} systemPathOrNode
 * @returns {number}
 */
export function computeAbilityMasteryValue(actor, systemPathOrNode) {
  const systemPath = resolveSystemPath(systemPathOrNode);
  if (!systemPath) return 0;

  const node = resolveTypedNode(actor, systemPathOrNode);
  const base = Number(foundry.utils.getProperty(actor, `${systemPath}.base.value`) ?? 0);
  return base + getRelatedCharacteristicDelta(actor, systemPath, node);
}

/**
 * @param {import('../../actor/ABFActor.js').ABFActor} actor
 * @param {string|import('../../actor/types/concreteTypes/Ability.js').Ability} systemPathOrNode
 * @returns {boolean}
 */
export function hasAbilityMastery(actor, systemPathOrNode) {
  return computeAbilityMasteryValue(actor, systemPathOrNode) >= MASTERY_THRESHOLD;
}
