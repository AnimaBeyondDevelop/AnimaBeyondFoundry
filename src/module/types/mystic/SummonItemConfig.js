import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';


/**
 * Initial data for a new summon. Used to infer the type of the data inside `summon.system`
 * @readonly
 */
export const INITIAL_SUMMON_DATA = {
  cost: { value: 0 },
  difficulty: { value: 0 },
  powers: []
};

/** @type {import("../Items").SummonItemConfig} */
export const SummonItemConfig = ABFItemConfigFactory({
  type: ABFItems.SUMMON,
  isInternal: false,
  hasSheet: true,
  defaultValue: INITIAL_SUMMON_DATA,
  fieldPath: ['mystic', 'summons'],
  selectors: {
    addItemButtonSelector: 'add-summon',
    containerSelector: '#summons-context-menu-container',
    rowSelector: '.summon-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.summon.content')
    });

    const itemData = {
      name,
      type: ABFItems.SUMMON,
      system: INITIAL_SUMMON_DATA
    };

    await actor.createItem(itemData);
  }
});
