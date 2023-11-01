import { ABFItems } from '../../items/ABFItems';
import { openComplexInputDialog } from '../../utils/dialogs/openComplexInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';
import { shieldValueCheck } from '../../combat/utils/shieldValueCheck.js';
import { newPsychicRollABF } from '../../utils/functions/newRollABF';
import { psychicPotentialEffect } from '../../combat/utils/psychicPotentialEffect.js';
import { shieldBaseValueCheck } from '../../combat/utils/shieldBaseValueCheck.js';
import { executeMacro } from '../../utils/functions/executeMacro';

/**
 * Initial data for a new psychic power. Used to infer the type of the data inside `power.system`
 * @readonly
 */
export const INITIAL_PSYCHIC_SHIELD_DATA = {
  overmantained: false,
  damageBarrier: { value: 0 },
  shieldPoints: {
    value: 0,
    maintainMax: 0
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
  onCreate: async actor => {
    const results = await openComplexInputDialog(actor, 'newPsychicShield');
    const powerID = results['new.psychicShield.id'];
    const powerDifficulty = results['new.psychicShield.difficulty'];
    const power = actor.system.psychic.psychicPowers.find(i => i._id == powerID);
    const name = power.name;
    if (!power) {
      return;
    }
    let item;
    if (powerDifficulty == 'roll') {
      const supShield = await newPsychicRollABF(power, actor);
      item = await actor.createItem({
        name,
        type: ABFItems.PSYCHIC_SHIELD,
        system: supShield.system
      });
    } else {
      const maintainMax =
        shieldBaseValueCheck(
          psychicPotentialEffect(actor.system.psychic.psychicPotential.base.value, 0),
          power?.system.effects
        )[0] ?? 0;
      const shieldPoints = shieldValueCheck(
        power.system.effects[powerDifficulty].value
      )[0];
      const overmantained = maintainMax >= shieldPoints;
      item = await actor.createItem({
        name,
        type: ABFItems.PSYCHIC_SHIELD,
        system: {
          overmantained,
          damageBarrier: { value: 0 },
          shieldPoints: {
            value: shieldPoints,
            maintainMax: maintainMax
          }
        }
      });
    }
    let args = {
      thisActor: actor,
      newShield: true,
      shieldId: item._id
    };
    executeMacro(name, args);
  }
});
