import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * @readonly
 * @enum {string}
 */
export const Effects = {
  NONE: 'none',
  PAIN: 'pain',
  DAMAGE: 'damage',
  WEAKNESS: 'weakness',
  PENALTY: 'penalty',
  RAGE: 'rage',
  TERROR: 'terror',
  HALLUCINATIONS: 'hallucinations',
  BLINDNESS: 'blindness',
  PARALYSIS: 'paralysis',
  UNCONSCIOUSNESS: 'unconsciousness',
  DEATH: 'death'
}

/**
 * @readonly
 * @enum {string}
 */
export const Activation = {
  NORMAL: 'normal',
  QUICK: 'quick',
  INSTANTANEOUS: 'instantaneous'
}

/**
 * @readonly
 * @enum {string}
 */
export const Duration = {
  NORMAL: 'normal',
  LONG: 'long'
}

/**
 * @readonly
 * @enum {string}
 */
export const Transmission = {
  BLOOD: 'blood',
  INGESTION: 'ingestion',
  CONTACT: 'contact',
  INHALING: 'inhaling'
}

/** @type {import("../Items").PoisonItemData} */
export const INITIAL_POISON_DATA = {
  level: 0,
  effects: { main: { type: 'none', check: 0 }, secondary: { type: 'none', check: 0 } },
  activation: 'normal',
  duration: 'normal',
  transmission: ''
};

/** @type {import("../Items").PoisonItemConfig} */
export const PoisonItemConfig = ABFItemConfigFactory({
  type: ABFItems.POISON,
  isInternal: false,
  defaultValue: INITIAL_POISON_DATA,
  hasSheet: true,
  fieldPath: ['combat', 'poisons'],
  selectors: {
    addItemButtonSelector: 'add-poison',
    containerSelector: '#poisons-context-menu-container',
    rowSelector: '.poison-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.poisons.content')
    });

    const itemData = {
      name,
      type: ABFItems.POISON,
      system: INITIAL_POISON_DATA
    };

    await actor.createItem(itemData);
  }
});
