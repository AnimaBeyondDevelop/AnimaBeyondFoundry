import { ABFItems } from '../../items/ABFItems';
import { openComplexInputDialog } from '../../utils/dialogs/openComplexInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * Initial data for a new innate psychic power. Used to infer the type of the data inside `innatePsychicPower.system`
 * @readonly
 */
export const INITIAL_INNATE_PSYCHIC_POWER_DATA = {
  effect: ''
};

/** @type {import("../Items").InnatePsychicPowerItemConfig} */
export const InnatePsychicPowerItemConfig = ABFItemConfigFactory({
  type: ABFItems.INNATE_PSYCHIC_POWER,
  isInternal: true,
  fieldPath: ['psychic', 'innatePsychicPowers'],
  selectors: {
    addItemButtonSelector: 'add-innate-psychic-power',
    containerSelector: '#innate-psychic-powers-context-menu-container',
    rowSelector: '.innate-psychic-power-row'
  },
  onCreate: async actor => {
    const results = await openComplexInputDialog(actor, 'newInnatePsychicPower');
    const powerId = results['new.innatePsychicPower.id'];
    const power = actor.system.psychic.psychicPowers.find(i => i._id === powerId);
    if (!power) {
      return;
    }
    const name = power.name;
    const innatePsychicDifficulty = actor.innatePsychicDifficulty(power);
    const effect = power.system.effects[innatePsychicDifficulty]?.value ?? '';

    await actor.createInnerItem({
      name,
      type: ABFItems.INNATE_PSYCHIC_POWER,
      system: {
        effect
      }
    });
  }
});
