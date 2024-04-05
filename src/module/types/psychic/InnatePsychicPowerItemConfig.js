import { ABFItems } from '../../items/ABFItems';
import { openComplexInputDialog } from '../../utils/dialogs/openComplexInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';
import { executeMacro } from '../../utils/functions/executeMacro';

/**
 * Initial data for a new innate psychic power. Used to infer the type of the data inside `innatePsychicPower.system`
 * @readonly
 */
export const INITIAL_INNATE_PSYCHIC_POWER_DATA = {
  effect: '',
  improveInnatePower: 0
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
    const improveInnatePower = results['new.innatePsychicPower.improveInnatePower']
    const power = actor.system.psychic.psychicPowers.find(i => i._id === powerId);
    if (!power) {
      return;
    }
    const name = power.name;
    const innatePsychicDifficulty = actor.innatePsychicDifficulty(power, improveInnatePower);
    const effect = power.system.effects[innatePsychicDifficulty]?.value ?? '';

    await actor.createInnerItem({
      name,
      type: ABFItems.INNATE_PSYCHIC_POWER,
      system: {
        effect,
        improveInnatePower,
        power
      }
    });
    actor.consumePsychicPoints(improveInnatePower)
  },
  onDelete: async (actor, target) => {
    const { itemId } = target[0].dataset;

    if (!itemId) {
      throw new Error('Data id missing. Are you sure to set data-item-id to rows?');
    }

    const innatePsychicPower = actor.getInnerItem(ABFItems.INNATE_PSYCHIC_POWER, itemId);

    await actor.deleteInnerItem(innatePsychicPower.type, [innatePsychicPower._id])

    if (innatePsychicPower.system.supShieldId) {
      actor.deleteSupernaturalShield(innatePsychicPower.system.supShieldId)
    } else {
      const args = {
          thisActor: actor,
          castedPsychicPowerId: innatePsychicPower.system.castedPsychicPowerId,
          release: true
      }
      executeMacro(innatePsychicPower.name, args)
    }
  }
});
