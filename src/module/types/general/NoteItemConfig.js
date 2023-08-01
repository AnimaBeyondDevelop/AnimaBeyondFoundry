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
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({
        id,
        type: ABFItems.NOTE,
        name
      });
    }
  },
  onAttach: async (actor, item) => {
    item.system.enrichedName = await TextEditor.enrichHTML(item.name ?? '', {
      async: true
    });
  }
});
