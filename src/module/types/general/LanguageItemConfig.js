import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").LanguageItemConfig} */
export const LanguageItemConfig = ABFItemConfigFactory({
  type: ABFItems.LANGUAGE,
  isInternal: true,
  fieldPath: ['general', 'languages', 'others'],
  getFromDynamicChanges: changes => {
    return changes.system.dynamic.languages;
  },
  selectors: {
    addItemButtonSelector: 'add-language',
    containerSelector: '#languages-context-menu-container',
    rowSelector: '.language-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.language.content')
    });

    actor.createInnerItem({
      type: ABFItems.LANGUAGE,
      name
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      actor.updateInnerItem({
        type: ABFItems.LANGUAGE,
        id,
        name
      });
    }
  }
});
