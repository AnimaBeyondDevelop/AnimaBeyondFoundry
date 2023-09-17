import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").MetamagicItemConfig} */
export const MetamagicItemConfig = ABFItemConfigFactory({
  type: ABFItems.METAMAGIC,
  isInternal: true,
  fieldPath: ['mystic', 'metamagics'],
  selectors: {
    addItemButtonSelector: 'add-metamagic',
    containerSelector: '#metamagics-context-menu-container',
    rowSelector: '.metamagic-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.metamagic.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.METAMAGIC,
      system: { grade: { value: 0 } }
    });
  }
});
