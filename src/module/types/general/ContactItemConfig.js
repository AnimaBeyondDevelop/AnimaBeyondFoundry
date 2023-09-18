import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").ContactItemConfig} */
export const ContactItemConfig = ABFItemConfigFactory({
  type: ABFItems.CONTACT,
  isInternal: true,
  fieldPath: ['general', 'contacts'],
  selectors: {
    addItemButtonSelector: 'add-contact',
    containerSelector: '#contacts-context-menu-container',
    rowSelector: '.contact-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.contact.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.CONTACT
    });
  }
});
