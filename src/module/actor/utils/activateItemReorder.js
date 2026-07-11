import { reorderEmbeddedItems, ITEM_REORDER_MIME } from './reorderEmbeddedItems.js';
import { resolveDropContext } from './buildItemSortUpdates.js';
import { WeaponItemConfig } from '../../types/combat/WeaponItemConfig.js';
import { ArmorItemConfig } from '../../types/combat/ArmorItemConfig.js';
import { EffectItemConfig } from '../../types/effects/EffectItemConfig.js';

const REORDERABLE_ITEM_CONFIGS = [WeaponItemConfig, ArmorItemConfig, EffectItemConfig];

const DRAG_OVER_TOP = 'drag-over-top';
const DRAG_OVER_BOTTOM = 'drag-over-bottom';

function clearDragOverClasses(container) {
  container
    .querySelectorAll(`.${DRAG_OVER_TOP}, .${DRAG_OVER_BOTTOM}`)
    .forEach(el => el.classList.remove(DRAG_OVER_TOP, DRAG_OVER_BOTTOM));
}

/**
 * @param {import('../ABFActorSheet.js').default} sheet
 * @param {JQuery} html
 */
export function activateItemReorder(sheet, html) {
  sheet._itemReorderAbort?.abort();
  sheet._itemReorderAbort = new AbortController();
  const { signal } = sheet._itemReorderAbort;

  for (const config of REORDERABLE_ITEM_CONFIGS) {
    bindReorderHandlers(sheet, html, config, signal);
  }
}

function bindReorderHandlers(sheet, html, config, signal) {
  const { containerSelector, rowSelector } = config.selectors;
  const container = html.find(containerSelector)[0];
  if (!container) return;

  let draggedId = null;
  let reorderPending = false;

  const onDragStart = ev => {
    const handle = ev.target.closest?.('.item-drag-handle');
    if (!handle || !container.contains(handle)) return;

    const row = handle.closest(rowSelector);
    draggedId = row?.dataset?.itemId ?? null;
    if (!draggedId) return;

    ev.stopPropagation();
    sheet._isReorderingItems = true;

    ev.dataTransfer.setData(ITEM_REORDER_MIME, draggedId);
    ev.dataTransfer.effectAllowed = 'move';
    row.classList.add('dragging');
    row.dataset.wasDraggable = row.getAttribute('draggable') ?? 'true';
    row.setAttribute('draggable', 'false');
  };

  const onDragEnd = ev => {
    const handle = ev.target.closest?.('.item-drag-handle');
    if (!handle || !container.contains(handle)) return;

    const row = handle.closest(rowSelector);
    row?.classList.remove('dragging');
    if (row) {
      row.setAttribute('draggable', row.dataset.wasDraggable ?? 'true');
      delete row.dataset.wasDraggable;
    }
    draggedId = null;
    clearDragOverClasses(container);

    if (!reorderPending) {
      sheet._isReorderingItems = false;
    }
  };

  const onDragOver = ev => {
    if (!sheet._isReorderingItems || !draggedId) return;

    const context = resolveDropContext(container, rowSelector, ev.clientX, ev.clientY, {
      excludeId: draggedId
    });
    if (!context) return;

    ev.preventDefault();
    ev.stopPropagation();
    ev.dataTransfer.dropEffect = 'move';

    clearDragOverClasses(container);
    context.row.classList.add(
      context.position === 'before' ? DRAG_OVER_TOP : DRAG_OVER_BOTTOM
    );
  };

  const onDrop = async ev => {
    if (!sheet._isReorderingItems || !draggedId) return;

    const context = resolveDropContext(container, rowSelector, ev.clientX, ev.clientY, {
      excludeId: draggedId
    });
    if (!context) return;

    ev.preventDefault();
    ev.stopPropagation();
    clearDragOverClasses(container);

    const sourceId = draggedId;
    draggedId = null;
    reorderPending = true;

    try {
      await reorderEmbeddedItems(sheet.actor, {
        sourceId,
        targetId: context.targetId,
        insertAfter: context.position === 'after',
        itemType: config.type,
        container,
        rowSelector: config.selectors.rowSelector
      });
    } finally {
      reorderPending = false;
      sheet._isReorderingItems = false;
    }
  };

  const onDragEnter = ev => {
    if (!sheet._isReorderingItems) return;
    ev.preventDefault();
  };

  const captureOpts = { capture: true, signal };
  const bubbleOpts = { signal };

  container.addEventListener('dragstart', onDragStart, bubbleOpts);
  container.addEventListener('dragend', onDragEnd, bubbleOpts);
  container.addEventListener('dragenter', onDragEnter, captureOpts);
  container.addEventListener('dragover', onDragOver, captureOpts);
  container.addEventListener('drop', onDrop, captureOpts);
}
