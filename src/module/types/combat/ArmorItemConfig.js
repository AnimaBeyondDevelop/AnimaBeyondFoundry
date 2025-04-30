import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").ArmorItemConfig} */
export const ArmorItemConfig = ABFItemConfigFactory({
  type: ABFItems.ARMOR,
  isInternal: false,
  hasSheet: true,
  fieldPath: ['combat', 'armors'],
  selectors: {
    addItemButtonSelector: 'add-armor',
    containerSelector: '#armors-context-menu-container',
    rowSelector: '.armor-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.armors.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.ARMOR
    });
  }
});
