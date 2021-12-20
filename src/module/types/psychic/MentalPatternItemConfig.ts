import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';

export type MentalPatternItemData = {
  bonus: { value: number };
  penalty: { value: number };
};

export type MentalPatternDataSource = ABFItemBaseDataSource<ABFItems.MENTAL_PATTERN, MentalPatternItemData>;

export type MentalPatternChanges = ItemChanges<MentalPatternItemData>;

export const MentalPatternItemConfig: ABFItemConfig<MentalPatternDataSource, MentalPatternChanges> = {
  type: ABFItems.MENTAL_PATTERN,
  isInternal: false,
  fieldPath: ['psychic', 'mentalPatterns'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.mentalPatterns as MentalPatternChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-mental-pattern',
    containerSelector: '#mental-patterns-context-menu-container',
    rowSelector: '.mental-pattern-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog<string>({
      content: i18n.localize('dialogs.items.mentalPattern.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.MENTAL_PATTERN,
      data: {
        bonus: { value: 0 },
        penalty: { value: 0 }
      }
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await actor.updateItem({
        id,
        name,
        data
      });
    }
  },
  onAttach: (data, item) => {
    const items = data.psychic.mentalPatterns as MentalPatternDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.psychic.mentalPatterns as MentalPatternDataSource[]) = [item];
    }
  }
};
