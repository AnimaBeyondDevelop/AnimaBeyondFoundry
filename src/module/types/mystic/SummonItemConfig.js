import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").SummonItemConfig} */
export const SummonItemConfig = ABFItemConfigFactory({
  type: ABFItems.SUMMON,
  isInternal: true,
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

    await actor.createInnerItem({
      name,
      type: ABFItems.SUMMON
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      await actor.updateInnerItem({ id, type: ABFItems.SUMMON, name });
    }
  },
});
