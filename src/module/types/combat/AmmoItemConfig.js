import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").AmmoItemConfig} */
export const AmmoItemConfig = ABFItemConfigFactory({
  type: ABFItems.AMMO,
  isInternal: false,
  hasSheet: true,
  fieldPath: ['combat', 'ammo'],
  selectors: {
    addItemButtonSelector: 'add-ammo',
    containerSelector: '#ammo-context-menu-container',
    rowSelector: '.ammo-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.ammo.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.AMMO
    });
  }
});
