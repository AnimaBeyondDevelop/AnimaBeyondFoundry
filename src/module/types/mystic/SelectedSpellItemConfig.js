import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").SelectedSpellItemConfig} */
export const SelectedSpellItemConfig = ABFItemConfigFactory({
  type: ABFItems.SELECTED_SPELL,
  isInternal: true,
  fieldPath: ['mystic', 'selectedSpells'],
  selectors: {
    addItemButtonSelector: 'add-selected-spell',
    containerSelector: '#selected-spells-context-menu-container',
    rowSelector: '.selected-spell-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.selectedSpell.content')
    });

    actor.createInnerItem({
      type: ABFItems.SELECTED_SPELL,
      name,
      system: { cost: { value: 0 } }
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name, system } = changes[id];

      actor.updateInnerItem({
        type: ABFItems.SELECTED_SPELL,
        id,
        name,
        system
      });
    }
  },
});
