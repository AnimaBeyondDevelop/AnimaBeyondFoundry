import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * Initial data for a new psychic power. Used to infer the type of the data inside `power.system`
 * @readonly
 */
export const INITIAL_PSYCHIC_SHIELD_DATA = {
    maintain: { value: false },
    shieldPoints: {
        base: { value: 0 },
        final: { value: 0 }
    }
};

/** @type {import("../Items").PsychicShieldItemConfig} */
export const PsychicShieldItemConfig = ABFItemConfigFactory({
  type: ABFItems.PSYCHIC_SHIELD,
  isInternal: false,
  fieldPath: ['psychic', 'psychicShields'],
  selectors: {
    addItemButtonSelector: 'add-psychic-shield',
    containerSelector: '#psychic-shields-context-menu-container',
    rowSelector: '.psychic-shield-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.psychicShield.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.PSYCHIC_SHIELD,
      system: INITIAL_PSYCHIC_SHIELD_DATA
    });
  }
});
