import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type SummonItemData = Record<string, never>;

export type SummonDataSource = ABFItemBaseDataSource<ABFItems.SUMMON, SummonItemData>;

export type SummonChanges = ItemChanges<SummonItemData>;

export const SummonItemConfig: ABFItemConfig<SummonDataSource, SummonChanges> = {
  type: ABFItems.SUMMON,
  isInternal: true,
  fieldPath: ['mystic', 'summons'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.summons as SummonChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-summon',
    containerSelector: '#summons-context-menu-container',
    rowSelector: '.summon-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog<string>({
      content: i18n.localize('dialogs.items.summon.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.SUMMON
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({ id, type: ABFItems.SUMMON, name });
    }
  },
  onAttach: (data, item) => {
    const items = data.mystic.summons as SummonDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.mystic.summons as SummonDataSource[]) = [item];
    }
  }
};
