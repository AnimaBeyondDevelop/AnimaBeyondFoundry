import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * @readonly
 * @enum {string}
 */
export const PsychicPowerActionTypes = {
  ACTIVE: 'active',
  PASSIVE: 'passive'
};

/**
 * Initial data for a new psychic power. Used to infer the type of the data inside `power.system`
 * @readonly
 */
export const INITIAL_PSYCHIC_POWER_DATA = {
  description: { value: '' },
  level: { value: 0 },
  effects: {
    20: { value: '' },
    40: { value: '' },
    80: { value: '' },
    120: { value: '' },
    140: { value: '' },
    180: { value: '' },
    240: { value: '' },
    280: { value: '' },
    320: { value: '' },
    440: { value: '' }
  },
  actionType: { value: PsychicPowerActionTypes.ACTIVE },
  hasMaintenance: { value: false },
  bonus: { value: 0 }
};

/** @type {import("../Items").PsychicPowerItemConfig} */
export const PsychicPowerItemConfig = ABFItemConfigFactory({
  type: ABFItems.PSYCHIC_POWER,
  isInternal: false,
  defaultValue: INITIAL_PSYCHIC_POWER_DATA,
  hasSheet: true,
  fieldPath: ['psychic', 'psychicPowers'],
  selectors: {
    addItemButtonSelector: 'add-psychic-power',
    containerSelector: '#psychic-powers-context-menu-container',
    rowSelector: '.psychic-power-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.psychicPower.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.PSYCHIC_POWER,
      system: INITIAL_PSYCHIC_POWER_DATA
    });
  },
  prepareItem: async (psychicPower) => {
    psychicPower.system.enrichedDescription = await TextEditor.enrichHTML(
      psychicPower.system.description?.value ?? '',
      { async: true }
    );
  }
});
