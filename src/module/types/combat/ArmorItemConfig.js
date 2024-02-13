import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * @readonly
 * @enum {string}
 */
export const ArmorLocation = {
  COMPLETE: 'complete',
  NIGHTDRESS: 'nightdress',
  BREASTPLATE: 'breastplate',
  HEAD: 'head'
};

/**
 * @readonly
 * @enum {string}
 */
export const ArmorType = {
  SOFT: 'soft',
  HARD: 'hard',
  NATURAL: 'natural'
};

/** @type {import("../Items").DerivedField} */
const derivedFieldInitialData = {
  base: { value: 0 },
  final: { value: 0 }
};

/** @type {import("../Items").ArmorItemData} */
export const INITIAL_ARMOR_DATA = {
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
  perceptionPenalty: derivedFieldInitialData,
  isEnchanted: { value: false },
  type: { value: ArmorType.SOFT },
  localization: { value: ArmorLocation.BREASTPLATE },
  quality: { value: 0 },
  equipped: { value: false }
};

/** @type {import("../Items").ArmorItemConfig} */
export const ArmorItemConfig = ABFItemConfigFactory({
  type: ABFItems.ARMOR,
  isInternal: false,
  hasSheet: true,
  defaultValue: INITIAL_ARMOR_DATA,
  fieldPath: ['combat', 'armors'],
  selectors: {
    addItemButtonSelector: 'add-armor',
    containerSelector: '#armors-context-menu-container',
    rowSelector: '.armor-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.armors.content')
    });

    const itemData = {
      name,
      type: ABFItems.ARMOR,
      system: INITIAL_ARMOR_DATA
    };

    await actor.createItem(itemData);
  }
});
