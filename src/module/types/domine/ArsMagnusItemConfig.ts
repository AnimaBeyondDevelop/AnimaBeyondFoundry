import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type ArsMagnusItemData = Record<string, never>;

export type ArsMagnusDataSource = ABFItemBaseDataSource<ABFItems.ARS_MAGNUS, ArsMagnusItemData>;

export type ArsMagnusChanges = ItemChanges<ArsMagnusItemData>;

export const ArsMagnusItemConfig: ABFItemConfigMinimal<ArsMagnusDataSource> = {
  type: ABFItems.ARS_MAGNUS,
  isInternal: true,
  fieldPath: ['domine', 'arsMagnus'],
  selectors: {
    addItemButtonSelector: 'add-ars-magnus',
    containerSelector: '#ars-magnus-context-menu-container',
    rowSelector: '.ars-magnus-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.arsMagnus.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.ARS_MAGNUS
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({ id, type: ABFItems.ARS_MAGNUS, name });
    }
  },
};
