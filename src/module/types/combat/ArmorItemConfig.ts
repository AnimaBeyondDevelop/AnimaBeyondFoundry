import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, DerivedField, ItemChanges } from '../Items';
import { normalizeItem } from '../../actor/utils/prepareActor/utils/normalizeItem';

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

export type ArmorDataSource = any;

export type ArmorChanges = ItemChanges<ArmorItemData>;

const derivedFieldInitialData = {
  base: { value: 0 },
  final: { value: 0 }
};

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
  defaultValue: INITIAL_ARMOR_DATA,
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

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.armors.content')
    });

    const itemData: any = {
      name,
      type: ABFItems.ARMOR,
      system: INITIAL_ARMOR_DATA
    };

    await actor.createItem(itemData);
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await actor.updateItem({
        id,
        name,
        system: data
      });
    }
  },
};
