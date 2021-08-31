import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../actor/utils/prepareSheet/prepareItems/ABFItems';
import { openDialog } from '../../utils/openDialog';
import { ABFItemConfig, ItemChanges } from '../Items';

export type ArmorItemData = {
  cut: { value: number };
  impact: { value: number };
  thrust: { value: number };
  heat: { value: number };
  electricity: { value: number };
  cold: { value: number };
  energy: { value: number };
  integrity: { value: number };
  presence: { value: number };
  wearArmorRequirement: { value: number };
  movementRestriction: { base: { value: number }; final: { value: number } };
  naturalPenalty: { value: number };
  type: { value: string };
  localization: { value: string };
  quality: { value: number };
  equipped: { value: boolean };
};

export type ArmorDataSource = ABFItemBaseDataSource<ABFItems.ARMOR, ArmorItemData>;

export type ArmorChanges = ItemChanges<ArmorItemData>;

export const ArmorItemConfig: ABFItemConfig<ArmorDataSource, ArmorChanges> = {
  type: ABFItems.ARMOR,
  isInternal: false,
  hasSheet: true,
  fieldPath: ['combat', 'armors'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.armors as ArmorChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-armor',
    containerSelector: '#armors-context-menu-container',
    rowSelector: '.armor-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openDialog<string>({
      content: i18n.localize('dialogs.items.armors.content')
    });

    const itemData: Omit<ArmorDataSource, '_id'> = {
      name,
      type: ABFItems.ARMOR,
      data: {
        cut: { value: 0 },
        impact: { value: 0 },
        thrust: { value: 0 },
        heat: { value: 0 },
        electricity: { value: 0 },
        cold: { value: 0 },
        energy: { value: 0 },
        integrity: { value: 0 },
        presence: { value: 0 },
        wearArmorRequirement: { value: 0 },
        movementRestriction: { base: { value: 0 }, final: { value: 0 } },
        naturalPenalty: { value: 0 },
        type: { value: '' },
        localization: { value: '' },
        quality: { value: 0 },
        equipped: { value: false }
      }
    };

    await actor.createItem(itemData);
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      actor.updateItem({
        id,
        name,
        data
      });
    }
  },
  onAttach: (data, item) => {
    const items = data.combat.armors as ArmorDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.combat.armors as ArmorDataSource[]) = [item];
    }
  }
};
