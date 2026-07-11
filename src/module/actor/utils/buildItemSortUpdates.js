/**
 * @param {HTMLElement} row
 * @param {number} clientX
 * @param {number} clientY
 * @returns {'before' | 'after'}
 */
export function resolveInsertPosition(row, clientX, clientY) {
  const footer = row.querySelector(':scope > .common-group > .group-footer');
  if (footer) {
    const footerRect = footer.getBoundingClientRect();
    return clientY >= footerRect.top ? 'after' : 'before';
  }

  const effectControls = row.querySelector(':scope > .effect-controls');
  if (effectControls) {
    const controlsRect = effectControls.getBoundingClientRect();
    const inControls =
      clientX >= controlsRect.left &&
      clientX <= controlsRect.right &&
      clientY >= controlsRect.top &&
      clientY <= controlsRect.bottom;

    return inControls ? 'after' : 'before';
  }

  const rect = row.getBoundingClientRect();
  return clientY < rect.top + rect.height / 2 ? 'before' : 'after';
}

/**
 * @param {HTMLElement} row
 * @param {number} clientX
 * @param {number} clientY
 * @returns {boolean}
 */
export function resolveInsertBefore(row, clientX, clientY) {
  return resolveInsertPosition(row, clientX, clientY) === 'before';
}

/**
 * @param {HTMLElement} container
 * @param {string} rowSelector
 * @param {number} clientX
 * @param {number} clientY
 * @param {object} [options]
 * @param {string} [options.excludeId]
 * @returns {{ row: HTMLElement, targetId: string, position: 'before' | 'after' } | null}
 */
export function resolveDropContext(container, rowSelector, clientX, clientY, { excludeId } = {}) {
  if (!container) return null;

  const rows = container.querySelectorAll(rowSelector);
  let bestRow = null;
  let bestDistance = Infinity;

  for (const row of rows) {
    const targetId = row.dataset?.itemId;
    if (!targetId || targetId === excludeId) continue;

    const rect = row.getBoundingClientRect();
    if (clientY < rect.top || clientY > rect.bottom) continue;
    if (clientX < rect.left || clientX > rect.right) continue;

    const distance = Math.abs(clientY - (rect.top + rect.height / 2));
    if (distance < bestDistance) {
      bestDistance = distance;
      bestRow = row;
    }
  }

  if (!bestRow) return null;

  return {
    row: bestRow,
    targetId: bestRow.dataset.itemId,
    position: resolveInsertPosition(bestRow, clientX, clientY)
  };
}

/**
 * @param {HTMLElement} container
 * @param {string} [rowSelector]
 * @returns {string[]}
 */
export function getOrderedItemIdsFromContainer(container, rowSelector) {
  if (!container) return [];

  const elements = rowSelector
    ? container.querySelectorAll(rowSelector)
    : container.children;

  return [...elements].map(el => el.dataset?.itemId).filter(Boolean);
}

/**
 * @param {string[]} orderedIds
 * @param {string} sourceId
 * @param {string} targetId
 * @param {boolean} insertAfter
 * @returns {string[]}
 */
export function computeReorderedIds(orderedIds, sourceId, targetId, insertAfter) {
  const result = orderedIds.filter(id => id !== sourceId);
  const targetIndex = result.indexOf(targetId);
  if (targetIndex === -1) return orderedIds;

  const insertAt = insertAfter ? targetIndex + 1 : targetIndex;
  result.splice(insertAt, 0, sourceId);
  return result;
}

/**
 * @param {string[]} orderedIds
 * @param {number} [step=100]
 * @returns {Array<{ _id: string, sort: number }>}
 */
export function buildSortUpdatesFromOrderedIds(orderedIds, step = 100) {
  return orderedIds.map((id, index) => ({
    _id: id,
    sort: (index + 1) * step
  }));
}

/**
 * @param {HTMLElement} container
 * @param {object} [options]
 * @param {string} [options.excludeId]
 * @param {string} [options.rowSelector]
 * @returns {string[]}
 */
export function getItemIdsFromContainer(container, { excludeId, rowSelector } = {}) {
  if (!container) return [];

  const elements = rowSelector
    ? container.querySelectorAll(rowSelector)
    : container.children;

  const ids = [];
  for (const el of elements) {
    const id = el.dataset?.itemId;
    if (id && id !== excludeId) ids.push(id);
  }
  return ids;
}

/**
 * @param {import('../ABFActor.js').default} actor
 * @param {HTMLElement} container
 * @param {string} sourceId
 * @param {string} [rowSelector]
 * @returns {import('../items/ABFItem.js').default[]}
 */
export function getSortSiblingsFromDom(actor, container, sourceId, rowSelector) {
  return getItemIdsFromContainer(container, { excludeId: sourceId, rowSelector })
    .map(id => actor.items.get(id))
    .filter(Boolean);
}
