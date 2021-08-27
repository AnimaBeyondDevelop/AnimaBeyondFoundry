import { ABFItems } from '../../actor/utils/prepareSheet/prepareItems/ABFItems';
import { openDialog } from '../../utils/openDialog';
import { ABFItemConfig, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type AmmoItemData = {
  amount: { value: number }
};

export type AmmoDataSource = ABFItemBaseDataSource<ABFItems.AMMO, AmmoItemData>;

export type AmmoChanges = ItemChanges<AmmoItemData>;

export const AmmoItemConfig: ABFItemConfig<AmmoDataSource, AmmoChanges> = {
  type: ABFItems.AMMO,
  isInternal: true,
  fieldPath: ['combat', 'ammo'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.ammo as AmmoChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-ammo',
    containerSelector: '#ammo-context-menu-container',
    rowSelector: '.ammo-row',
    rowIdData: 'ammoId'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openDialog<string>({
      content: i18n.localize('dialogs.items.ammo.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.AMMO,
      data: {
        amount: { value: 0 }
      }
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      actor.updateInnerItem({
        id,
        type: ABFItems.AMMO,
        name,
        data: {
          amount: { value: data.amount }
        }
      });
    }
  },
  onAttach: (data, item) => {
    const items = data.combat.ammo as AmmoDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.combat.ammo as AmmoDataSource[]) = [item];
    }
  }
};
