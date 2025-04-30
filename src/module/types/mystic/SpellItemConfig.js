import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").SpellItemConfig} */
export const SpellItemConfig = ABFItemConfigFactory({
  type: ABFItems.SPELL,
  isInternal: false,
  hasSheet: true,
  fieldPath: ['mystic', 'spells'],
  selectors: {
    addItemButtonSelector: 'add-spell',
    containerSelector: '#spells-context-menu-container',
    rowSelector: '.spell-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.spell.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.SPELL
    });
  }
});
