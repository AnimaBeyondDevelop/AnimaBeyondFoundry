import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { SpellGrades } from './SpellItemConfig';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").PreparedSpellItemConfig} */
export const PreparedSpellItemConfig = ABFItemConfigFactory({
  type: ABFItems.PREPARED_SPELL,
  isInternal: false,
  fieldPath: ['mystic', 'preparedSpells'],
  selectors: {
    addItemButtonSelector: 'add-prepared-spell',
    containerSelector: '#prepared-spells-context-menu-container',
    rowSelector: '.prepared-spell-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.preparedSpell.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.PREPARED_SPELL,
      system: { grade: { value: SpellGrades.BASE }, zeonAcc: { value: 0, max: 0 }, prepared: { value: false} }
    });
  }
});
