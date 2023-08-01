import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").TitleItemConfig} */
export const TitleItemConfig = ABFItemConfigFactory({
  type: ABFItems.TITLE,
  isInternal: true,
  fieldPath: ['general', 'titles'],
  selectors: {
    addItemButtonSelector: 'add-title',
    containerSelector: '#titles-context-menu-container',
    rowSelector: '.title-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.title.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.TITLE
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({ id, type: ABFItems.TITLE, name });
    }
  }
});
