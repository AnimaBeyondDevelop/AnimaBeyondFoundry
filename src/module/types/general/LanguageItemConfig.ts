import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type LanguageItemData = Record<string, never>;

export type LanguageDataSource = ABFItemBaseDataSource<
  ABFItems.LANGUAGE,
  LanguageItemData
>;

export type LanguageChanges = ItemChanges<LanguageItemData>;

export const LanguageItemConfig: ABFItemConfigMinimal<LanguageDataSource> = {
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
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.language.content')
    });

    actor.createInnerItem({
      type: ABFItems.LANGUAGE,
      name
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      actor.updateInnerItem({
        type: ABFItems.LANGUAGE,
        id,
        name
      });
    }
  },
  onAttach: (actor, item) => {
    const items = actor.getKnownLanguages();

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      actor.system.general.languages.others = [item];
    }
  }
};
