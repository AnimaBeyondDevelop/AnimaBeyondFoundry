import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';

export type InventoryItemItemData = {
  amount: { value: number };
  weight: { value: number };
};

export type InventoryItemDataSource = ABFItemBaseDataSource<
  ABFItems.INVENTORY_ITEM,
  InventoryItemItemData
>;

export type InventoryItemChanges = ItemChanges<InventoryItemItemData>;

export const InventoryItemItemConfig: ABFItemConfigMinimal<
  InventoryItemDataSource,
  InventoryItemChanges
> = {
  type: ABFItems.INVENTORY_ITEM,
  isInternal: true,
  fieldPath: ['general', 'inventory'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.inventory as InventoryItemChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-inventory-item',
    containerSelector: '#inventory-items-context-menu-container',
    rowSelector: '.inventory-item-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

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
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      actor.updateInnerItem({
        type: ABFItems.INVENTORY_ITEM,
        id,
        name,
        system: data
      });
    }
  },
  onAttach: (actor, item) => {
    const items = actor.getInventoryItems();

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      actor.system.general.inventory = [item];
    }
  }
};
