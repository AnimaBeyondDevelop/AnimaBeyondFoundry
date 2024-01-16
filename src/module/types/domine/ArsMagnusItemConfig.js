import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").ArsMagnusItemConfig} */
export const ArsMagnusItemConfig = ABFItemConfigFactory({
  type: ABFItems.ARS_MAGNUS,
  isInternal: true,
  fieldPath: ['domine', 'arsMagnus'],
  selectors: {
    addItemButtonSelector: 'add-ars-magnus',
    containerSelector: '#ars-magnus-context-menu-container',
    rowSelector: '.ars-magnus-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.arsMagnus.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.ARS_MAGNUS
    });
  }
});
