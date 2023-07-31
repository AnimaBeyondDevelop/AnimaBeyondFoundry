import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type TitleItemData = Record<string, never>;

export type TitleDataSource = ABFItemBaseDataSource<ABFItems.TITLE, TitleItemData>;

export type TitleChanges = ItemChanges<TitleItemData>;

export const TitleItemConfig: ABFItemConfigMinimal<TitleDataSource> = {
  type: ABFItems.TITLE,
  isInternal: true,
  fieldPath: ['general', 'titles'],
  selectors: {
    addItemButtonSelector: 'add-title',
    containerSelector: '#titles-context-menu-container',
    rowSelector: '.title-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.title.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.TITLE
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({ id, type: ABFItems.TITLE, name });
    }
  },
  onAttach: (actor, item) => {
    const items = actor.getTitles();

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      actor.system.general.titles = [item];
    }
  }
};
