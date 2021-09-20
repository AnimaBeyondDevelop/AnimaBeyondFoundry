import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type AdvantageItemData = Record<string, never>;

export type AdvantageDataSource = ABFItemBaseDataSource<ABFItems.ADVANTAGE, AdvantageItemData>;

export type AdvantageChanges = ItemChanges<AdvantageItemData>;

export const AdvantageItemConfig: ABFItemConfig<AdvantageDataSource, AdvantageChanges> = {
  type: ABFItems.ADVANTAGE,
  isInternal: false,
  fieldPath: ['general', 'advantages'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.advantages as AdvantageChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-advantage',
    containerSelector: '#advantages-context-menu-container',
    rowSelector: '.advantage-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog<string>({
      content: i18n.localize('dialogs.items.advantage.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.ADVANTAGE
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateItem({ id, name });
    }
  },
  onAttach: (data, item) => {
    const items = data.general.advantages as AdvantageDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.general.advantages as AdvantageDataSource[]) = [item];
    }
  }
};
