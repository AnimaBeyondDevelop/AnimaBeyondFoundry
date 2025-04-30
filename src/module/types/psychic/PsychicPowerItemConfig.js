import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").PsychicPowerItemConfig} */
export const PsychicPowerItemConfig = ABFItemConfigFactory({
  type: ABFItems.PSYCHIC_POWER,
  isInternal: false,
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
      type: ABFItems.PSYCHIC_POWER
    });
  }
});
