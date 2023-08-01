import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").InventoryItemConfig} */
export const InventoryItemItemConfig = ABFItemConfigFactory({
  type: ABFItems.INVENTORY_ITEM,
  isInternal: true,
  fieldPath: ['general', 'inventory'],
  selectors: {
    addItemButtonSelector: 'add-inventory-item',
    containerSelector: '#inventory-items-context-menu-container',
    rowSelector: '.inventory-item-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.inventoryItem.content')
    });

    actor.createInnerItem({
      type: ABFItems.INVENTORY_ITEM,
      name,
      system: {
        amount: { value: 0 },
        weight: { value: 0 }
      }
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name, system } = changes[id];

      actor.updateInnerItem({
        type: ABFItems.INVENTORY_ITEM,
        id,
        name,
        system
      });
    }
  }
});
