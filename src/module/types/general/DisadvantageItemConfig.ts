import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type DisadvantageItemData = Record<string, never>;

export type DisadvantageDataSource = ABFItemBaseDataSource<
  ABFItems.DISADVANTAGE,
  DisadvantageItemData
>;

export type DisadvantageChanges = ItemChanges<DisadvantageItemData>;

export const DisadvantageItemConfig: ABFItemConfigMinimal<
  DisadvantageDataSource,
  DisadvantageChanges
> = {
  type: ABFItems.DISADVANTAGE,
  isInternal: false,
  fieldPath: ['general', 'disadvantages'],
  getFromDynamicChanges: changes => {
    return changes.system.dynamic.disadvantages as DisadvantageChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-disadvantage',
    containerSelector: '#disadvantages-context-menu-container',
    rowSelector: '.disadvantage-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.disadvantage.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.DISADVANTAGE
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateItem({
        id,
        name
      });
    }
  },
  onAttach: (actor, item) => {
    const items = actor.getDisadvantages();

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      actor.system.general.disadvantages = [item];
    }
  }
};
