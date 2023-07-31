import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';

export type LevelItemData = {
  level: { value: number };
};

export type LevelDataSource = ABFItemBaseDataSource<ABFItems.LEVEL, LevelItemData>;

export type LevelChanges = ItemChanges<LevelItemData>;

export const LevelItemConfig: ABFItemConfigMinimal<LevelDataSource> = {
  type: ABFItems.LEVEL,
  isInternal: true,
  fieldPath: ['general', 'levels'],
  selectors: {
    addItemButtonSelector: 'add-level',
    containerSelector: '#level-context-menu-container',
    rowSelector: '.level-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.level.content')
    });

    actor.createInnerItem({ type: ABFItems.LEVEL, name, system: { level: 0 } });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, system } = changes[id];

      actor.updateInnerItem({ type: ABFItems.LEVEL, id, name, system });
    }
  },
  onAttach: (actor, item) => {
    const items = actor.getCategories();

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      actor.system.general.levels = [item];
    }
  }
};
