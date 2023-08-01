import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").LevelItemConfig} */
export const LevelItemConfig = ABFItemConfigFactory({
  type: ABFItems.LEVEL,
  isInternal: true,
  fieldPath: ['general', 'levels'],
  selectors: {
    addItemButtonSelector: 'add-level',
    containerSelector: '#level-context-menu-container',
    rowSelector: '.level-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.level.content')
    });

    actor.createInnerItem({ type: ABFItems.LEVEL, name, system: { level: 0 } });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name, system } = changes[id];

      actor.updateInnerItem({ type: ABFItems.LEVEL, id, name, system });
    }
  }
});
