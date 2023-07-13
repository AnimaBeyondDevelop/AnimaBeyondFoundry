import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';

export type SelectedSpellItemData = {
  cost: { value: number };
};

export type SelectedSpellDataSource = ABFItemBaseDataSource<
  ABFItems.SELECTED_SPELL,
  SelectedSpellItemData
>;

export type SelectedSpellChanges = ItemChanges<SelectedSpellItemData>;

export const SelectedSpellItemConfig: ABFItemConfig<
  SelectedSpellDataSource,
  SelectedSpellChanges
> = {
  type: ABFItems.SELECTED_SPELL,
  isInternal: true,
  fieldPath: ['mystic', 'selectedSpells'],
  getFromDynamicChanges: changes => {
    // TODO: is this `data.` ok or shoult id be `system`?
    return changes.data.dynamic.selectedSpells as SelectedSpellChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-selected-spell',
    containerSelector: '#selected-spells-context-menu-container',
    rowSelector: '.selected-spell-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.selectedSpell.content')
    });

    actor.createInnerItem({
      type: ABFItems.SELECTED_SPELL,
      name,
      system: { cost: { value: 0 } }
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      actor.updateInnerItem({
        type: ABFItems.SELECTED_SPELL,
        id,
        name,
        system: data
      });
    }
  },
};
