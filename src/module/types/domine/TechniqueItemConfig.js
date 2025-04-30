import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").TechniqueItemConfig} */
export const TechniqueItemConfig = ABFItemConfigFactory({
  type: ABFItems.TECHNIQUE,
  isInternal: false,
  fieldPath: ['domine', 'techniques'],
  selectors: {
    addItemButtonSelector: 'add-technique',
    containerSelector: '#techniques-context-menu-container',
    rowSelector: '.technique-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.technique.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.TECHNIQUE
    });
  }
});
