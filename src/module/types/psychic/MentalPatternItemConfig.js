import { ABFItems } from '../../items/ABFItems';
import { openComplexInputDialog } from '../../utils/dialogs/openComplexInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * Initial data, used to infer the type of the data inside an item's `system`
 * @readonly
 */
export const INITIAL_MENTAL_PATTERN_DATA = {
  bonus: { value: "" },
  penalty: { value: "" }
};

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
    const results = await openComplexInputDialog(actor, 'newMentalPattern');
    const name = results['new.mentalPattern.name'];

    await actor.createItem({
      name,
      type: ABFItems.MENTAL_PATTERN,
      system: INITIAL_MENTAL_PATTERN_DATA
    });
  }
});
