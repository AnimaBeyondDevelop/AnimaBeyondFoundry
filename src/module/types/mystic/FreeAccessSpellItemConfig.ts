import { ABFItems } from '../../actor/utils/prepareSheet/prepareItems/ABFItems';
import { openDialog } from '../../utils/openDialog';
import { ABFItemConfig, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type FreeAccessSpellItem = {
  level: { value: number };
};

export type FreeAccessSpellDataSource = ABFItemBaseDataSource<ABFItems.FREE_ACCESS_SPELL, FreeAccessSpellItem>;

export type FreeAccessSpellChange = {
  name: string;
  data: {
    level: { value: number };
  };
};

export type FreeAccessSpellChanges = ItemChanges<FreeAccessSpellChange>;

export const FreeAccessSpellItemConfig: ABFItemConfig<FreeAccessSpellDataSource, FreeAccessSpellChanges> = {
  type: ABFItems.FREE_ACCESS_SPELL,
  isInternal: false,
  fieldPath: ['mystic', 'freeAccessSpells'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.freeAccessSpells as FreeAccessSpellChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-free-access-spell',
    containerSelector: '#free-access-spells-context-menu-container',
    rowSelector: '.free-access-spell-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openDialog<string>({
      content: i18n.localize('dialogs.items.freeAccessSpell.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.FREE_ACCESS_SPELL,
      data: { level: { value: 0 }, cost: { value: 0 } }
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await actor.updateItem({ id, name, data });
    }
  },
  onAttach: (data, item) => {
    const items = data.mystic.freeAccessSpells as FreeAccessSpellDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.mystic.freeAccessSpells as FreeAccessSpellDataSource[]) = [item];
    }
  }
};
