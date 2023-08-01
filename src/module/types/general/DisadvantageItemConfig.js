import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").DisadvantageItemConfig} */
export const DisadvantageItemConfig = ABFItemConfigFactory({
  type: ABFItems.DISADVANTAGE,
  isInternal: false,
  fieldPath: ['general', 'disadvantages'],
  selectors: {
    addItemButtonSelector: 'add-disadvantage',
    containerSelector: '#disadvantages-context-menu-container',
    rowSelector: '.disadvantage-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.disadvantage.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.DISADVANTAGE
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateItem({
        id,
        name
      });
    }
  }
});
