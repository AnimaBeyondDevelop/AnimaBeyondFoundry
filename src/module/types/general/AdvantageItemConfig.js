import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").AdvantageItemConfig} */
export const AdvantageItemConfig = ABFItemConfigFactory({
  type: ABFItems.ADVANTAGE,
  isInternal: false,
  fieldPath: ['general', 'advantages'],
  selectors: {
    addItemButtonSelector: 'add-advantage',
    containerSelector: '#advantages-context-menu-container',
    rowSelector: '.advantage-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.advantage.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.ADVANTAGE
    });
  }
});
