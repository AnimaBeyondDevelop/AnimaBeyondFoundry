import {
  buildSortUpdatesFromOrderedIds,
  computeReorderedIds,
  getOrderedItemIdsFromContainer
} from './buildItemSortUpdates.js';

export const ITEM_REORDER_MIME = 'application/x-animabf-item-reorder';

/**
 * Reorders an embedded Item relative to siblings of the same type.
 * @param {import('../ABFActor.js').default} actor
 * @param {object} options
 * @param {string} options.sourceId
 * @param {string} options.targetId
 * @param {boolean} options.insertAfter
 * @param {string} options.itemType
 * @param {HTMLElement} [options.container]
 * @param {string} [options.rowSelector]
 */
export async function reorderEmbeddedItems(
  actor,
  { sourceId, targetId, insertAfter, itemType, container, rowSelector }
) {
  const source = actor.items.get(sourceId);
  const target = actor.items.get(targetId);

  if (!source || !target || source.type !== itemType || target.type !== itemType) return;
  if (source.id === target.id) return;

  const orderedIds = getOrderedItemIdsFromContainer(container, rowSelector).filter(
    id => actor.items.get(id)?.type === itemType
  );

  if (!orderedIds.includes(sourceId) || !orderedIds.includes(targetId)) return;

  const newOrder = computeReorderedIds(orderedIds, sourceId, targetId, insertAfter);
  const orderChanged = newOrder.some((id, index) => id !== orderedIds[index]);
  if (!orderChanged) return;

  const sortUpdates = buildSortUpdatesFromOrderedIds(newOrder);
  if (!sortUpdates.length) return;

  await actor.updateEmbeddedDocuments('Item', sortUpdates, { render: false });
  actor.sheet?.render(false);
}
