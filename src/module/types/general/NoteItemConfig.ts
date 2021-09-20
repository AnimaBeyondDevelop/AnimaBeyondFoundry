import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type NoteItemData = Record<string, never>;

export type NoteDataSource = ABFItemBaseDataSource<ABFItems.NOTE, NoteItemData>;

export type NoteChanges = ItemChanges<NoteItemData>;

export const NoteItemConfig: ABFItemConfig<NoteDataSource, NoteChanges> = {
  type: ABFItems.NOTE,
  isInternal: false,
  fieldPath: ['general', 'notes'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.notes as NoteChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-note',
    containerSelector: '#_notes-context-menu-container',
    rowSelector: '.note-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog<string>({
      content: i18n.localize('dialogs.items.note.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.NOTE
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({ id, type: ABFItems.NOTE, name });
    }
  },
  onAttach: (data, item) => {
    const items = data.general.notes as NoteDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.general.notes as NoteDataSource[]) = [item];
    }
  }
};
