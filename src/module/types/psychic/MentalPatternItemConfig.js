import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").MentalPatternItemConfig} */
export const MentalPatternItemConfig = ABFItemConfigFactory({
  type: ABFItems.MENTAL_PATTERN,
  isInternal: false,
  fieldPath: ['psychic', 'mentalPatterns'],
  selectors: {
    addItemButtonSelector: 'add-mental-pattern',
    containerSelector: '#mental-patterns-context-menu-container',
    rowSelector: '.mental-pattern-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.mentalPattern.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.MENTAL_PATTERN,
      system: {
        bonus: { value: 0 },
        penalty: { value: 0 }
      }
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name, system } = changes[id];

      await actor.updateItem({
        id,
        name,
        system
      });
    }
  }
});
