import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, DerivedField, ItemChanges } from '../Items';

export enum ArmorLocation {
  COMPLETE = 'complete',
  NIGHTDRESS = 'nightdress',
  BREASTPLATE = 'breastplate',
  HEAD = 'head'
}

export enum ArmorType {
  SOFT = 'soft',
  HARD = 'hard',
  NATURAL = 'natural'
}

export type ArmorItemData = {
  cut: DerivedField;
  impact: DerivedField;
  thrust: DerivedField;
  heat: DerivedField;
  electricity: DerivedField;
  cold: DerivedField;
  energy: DerivedField;
  integrity: DerivedField;
  presence: DerivedField;
  wearArmorRequirement: DerivedField;
  movementRestriction: DerivedField;
  naturalPenalty: DerivedField;
  isEnchanted: { value: boolean };
  type: { value: ArmorType };
  localization: { value: ArmorLocation };
  quality: { value: number };
  equipped: { value: boolean };
};

export type ArmorDataSource = ABFItemBaseDataSource<ABFItems.ARMOR, ArmorItemData>;

export type ArmorChanges = ItemChanges<ArmorItemData>;

const derivedFieldInitialData = { base: { value: 0 }, final: { value: 0 } };

export const INITIAL_ARMOR_DATA: ArmorItemData = {
  cut: derivedFieldInitialData,
  impact: derivedFieldInitialData,
  thrust: derivedFieldInitialData,
  heat: derivedFieldInitialData,
  electricity: derivedFieldInitialData,
  cold: derivedFieldInitialData,
  energy: derivedFieldInitialData,
  integrity: derivedFieldInitialData,
  presence: derivedFieldInitialData,
  wearArmorRequirement: derivedFieldInitialData,
  movementRestriction: derivedFieldInitialData,
  naturalPenalty: derivedFieldInitialData,
  isEnchanted: { value: false },
  type: { value: ArmorType.SOFT },
  localization: { value: ArmorLocation.BREASTPLATE },
  quality: { value: 0 },
  equipped: { value: false }
};

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

    const name = await openSimpleInputDialog<string>({
      content: i18n.localize('dialogs.items.armors.content')
    });

    const itemData: Omit<ArmorDataSource, '_id'> = {
      name,
      type: ABFItems.ARMOR,
      data: INITIAL_ARMOR_DATA
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

    item.data = foundry.utils.mergeObject(item.data, INITIAL_ARMOR_DATA, { overwrite: false });

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
