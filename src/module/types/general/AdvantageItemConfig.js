import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * @typedef {Record<string, never>} AdvantageItemData
 */

/**
 * @typedef {import("../Items").ItemChanges<AdvantageItemData>} AdvantageChanges
 */

/**
 * @typedef {import("../../../animabf.types").ABFItemBaseDataSource<ABFItems.ADVANTAGE, AdvantageItemData>} AdvantageDataSource
 */

/** @type {import("../Items").ABFItemConfig<AdvantageItemData>} */
export const AdvantageItemConfig = ABFItemConfigFactory({
  type: ABFItems.ADVANTAGE,
  isInternal: false,
  fieldPath: ['general', 'advantages'],
  selectors: {
    addItemButtonSelector: 'add-advantage',
    containerSelector: '#advantages-context-menu-container',
    rowSelector: '.advantage-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.advantage.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.ADVANTAGE
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
  },
});
