import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';

export type ContactItemData = {
  description: { value: string };
};

export type ContactDataSource = ABFItemBaseDataSource<ABFItems.CONTACT, ContactItemData>;

export type ContactChanges = ItemChanges<ContactItemData>;

export const ContactItemConfig: ABFItemConfig<ContactDataSource, ContactChanges> = {
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

    const name = await openSimpleInputDialog<string>({
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
        data
      });
    }
  },
  onAttach: (data, item) => {
    const items = data.general.contacts as ContactDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.general.contacts as ContactDataSource[]) = [item];
    }
  }
};
