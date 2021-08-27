import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../actor/utils/prepareSheet/prepareItems/ABFItems';
import { openDialog } from '../../utils/openDialog';
import { ABFItemConfig, ItemChanges } from '../Items';

export type MetamagicItemData = {
  grade: { value: number };
};

export type MetamagicDataSource = ABFItemBaseDataSource<ABFItems.METAMAGIC, MetamagicItemData>;

export type MetamagicChanges = ItemChanges<MetamagicItemData>;

export const MetamagicItemConfig: ABFItemConfig<MetamagicDataSource, MetamagicChanges> = {
  type: ABFItems.METAMAGIC,
  isInternal: true,
  fieldPath: ['mystic', 'metamagics'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.metamagics as MetamagicChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-metamagic',
    containerSelector: '#metamagics-context-menu-container',
    rowSelector: '.metamagic-row',
    rowIdData: 'metamagicId'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openDialog<string>({
      content: i18n.localize('dialogs.items.metamagic.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.METAMAGIC,
      data: { grade: { value: 0 } }
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await actor.updateInnerItem({ id, type: ABFItems.METAMAGIC, name, data });
    }
  },
  onAttach: (data, item) => {
    const items = data.mystic.metamagics as MetamagicDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.mystic.metamagics as MetamagicDataSource[]) = [item];
    }
  }
};
