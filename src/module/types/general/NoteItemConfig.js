import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").NoteItemConfig} */
export const NoteItemConfig = ABFItemConfigFactory({
  type: ABFItems.NOTE,
  isInternal: true,
  fieldPath: ['general', 'notes'],
  selectors: {
    addItemButtonSelector: 'add-note',
    containerSelector: '#_notes-context-menu-container',
    rowSelector: '.note-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.note.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.NOTE
    });
  },
  onAttach: async (actor, item) => {
    item.system.enrichedName = await TextEditor.enrichHTML(item.name ?? '', {
      async: true
    });
  }
});
