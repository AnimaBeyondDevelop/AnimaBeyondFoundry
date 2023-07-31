import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type SummonItemData = Record<string, never>;

export type SummonDataSource = ABFItemBaseDataSource<ABFItems.SUMMON, SummonItemData>;

export type SummonChanges = ItemChanges<SummonItemData>;

export const SummonItemConfig: ABFItemConfigMinimal<SummonDataSource> = {
  type: ABFItems.SUMMON,
  isInternal: true,
  fieldPath: ['mystic', 'summons'],
  selectors: {
    addItemButtonSelector: 'add-summon',
    containerSelector: '#summons-context-menu-container',
    rowSelector: '.summon-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
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
};
