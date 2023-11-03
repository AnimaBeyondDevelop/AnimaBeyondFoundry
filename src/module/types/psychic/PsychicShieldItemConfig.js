import { ABFItems } from '../../items/ABFItems';
import { openComplexInputDialog } from '../../utils/dialogs/openComplexInputDialog';
import { openModDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';

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
    const showRoll = true;
    let powerDifficulty = results['new.psychicShield.difficulty'];
    const power = actor.system.psychic.psychicPowers.find(i => i._id == powerID);
    if (!power) {
      return;
    }

    if (powerDifficulty == 'roll') {
      console.log(actor);
      const { i18n } = game;
      const mod = await openModDialog();
      const psychicPotential = actor.system.psychic.psychicPotential.final.value;
      const psychicPotentialRoll = new ABFFoundryRoll(
        `1d100PsychicRoll + ${psychicPotential} + ${mod}`,
        { ...actor.system, power }
      );
      psychicPotentialRoll.roll();
      powerDifficulty = psychicPotentialRoll.total;
      psychicPotentialRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: i18n.format('macros.combat.dialog.psychicPotential.title')
      });
      const fatigue = await actor.evaluatePsychicFatigue(
        power,
        psychicPotentialRoll.total,
        showRoll
      );
      if (fatigue) {
        return;
      }
    }
    const supernaturalShieldData = await actor.supernaturalShieldData(
      'psychic',
      power,
      powerDifficulty
    );
    await actor.newSupernaturalShield(supernaturalShieldData, 'psychic');
  }
});
