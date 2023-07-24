import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';

export type MetamagicItemData = {
  grade: { value: number };
};

export type MetamagicDataSource = ABFItemBaseDataSource<
  ABFItems.METAMAGIC,
  MetamagicItemData
>;

export type MetamagicChanges = ItemChanges<MetamagicItemData>;

export const MetamagicItemConfig: ABFItemConfigMinimal<MetamagicDataSource, MetamagicChanges> = {
  type: ABFItems.METAMAGIC,
  isInternal: true,
  fieldPath: ['mystic', 'metamagics'],
  getFromDynamicChanges: changes => {
    return changes.system.dynamic.metamagics as MetamagicChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-metamagic',
    containerSelector: '#metamagics-context-menu-container',
    rowSelector: '.metamagic-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.metamagic.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.METAMAGIC,
      system: { grade: { value: 0 } }
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, system } = changes[id];

      await actor.updateInnerItem({
        id,
        type: ABFItems.METAMAGIC,
        name,
        system
      });
    }
  }
};
