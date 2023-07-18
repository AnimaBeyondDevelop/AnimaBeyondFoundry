import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';

export type ContactItemData = {
  description: { value: string };
};

export type ContactDataSource = ABFItemBaseDataSource<ABFItems.CONTACT, ContactItemData>;

export type ContactChanges = ItemChanges<ContactItemData>;

export const ContactItemConfig: ABFItemConfigMinimal<ContactDataSource, ContactChanges> = {
  type: ABFItems.CONTACT,
  isInternal: true,
  fieldPath: ['general', 'contacts'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.contacts as ContactChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-contact',
    containerSelector: '#contacts-context-menu-container',
    rowSelector: '.contact-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.contact.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.CONTACT
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await actor.updateInnerItem({
        id,
        type: ABFItems.CONTACT,
        name,
        system: data
      });
    }
  },
};
