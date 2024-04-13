import { ABFItems } from '../../items/ABFItems';
import { openComplexInputDialog } from '../../utils/dialogs/openComplexInputDialog';
import { openModDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { SpellGrades } from '../mystic/SpellItemConfig';
import { definedMagicProjectionCost } from '../../combat/utils/definedMagicProjectionCost.js';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * Initial data for a new supernatural shield. Used to infer the type of the data inside `supernaturalShield.system`
 * @readonly
 */
export const INITIAL_SUPERNATURAL_SHIELD_DATA = {
  type: 'none',
  spellGrade: SpellGrades.BASE,
  damageBarrier: 0,
  shieldPoints: 0,
  metamagics: { definedMagicProjection: 0, defensiveExpertise: 0 },
  origin: ''
};

/** @type {import("../Items").SupernaturalShieldItemConfig} */
export const SupernaturalShieldItemConfig = ABFItemConfigFactory({
  type: ABFItems.SUPERNATURAL_SHIELD,
  isInternal: false,
  fieldPath: ['combat', 'supernaturalShields'],
  selectors: {
    addItemButtonSelector: 'add-supernatural-shield',
    containerSelector: '#supernatural-shields-context-menu-container',
    rowSelector: '.supernatural-shield-row'
  },
  hideDeleteRow: true,
  contextMenuConfig: {
    buildExtraOptionsInContextMenu: actor => [
      {
        name: game.i18n.localize('contextualMenu.superntarualShield.options.release'),
        icon: '<i class="fa fa-times" aria-hidden="true"></i>',
        callback: target => {
          const { itemId } = target[0].dataset;

          if (!itemId) throw new Error('supernaturalShieldId missing');

          actor.deleteSupernaturalShield(itemId);
        }
      }
    ]
  },
  onCreate: async actor => {
    const results = await openComplexInputDialog(actor, 'newSupernaturalShield');
    const { tab } = results;
    if (tab === 'mystic') {
      const spellID = results['new.mysticShield.id'];
      const spellGrade = results['new.mysticShield.grade'];
      const castSpell = results['data.mystic.castSpell'];
      const innate = castSpell === 'innate';
      const prepared = castSpell === 'prepared';
      const override = castSpell === 'override';
      const definedMagicProjection = results['data.mystic.metamagics.definedMagicProjection'];
      const defensiveExpertise = +definedMagicProjection ? 0 : results['data.mystic.metamagics.defensiveExpertise'];
      const spell = actor.system.mystic.spells.find(i => i._id === spellID);
      if (!spell) {
        return;
      }
      actor.setFlag('animabf', 'spellCastingOverride', override);
      const zeonPoolCost = definedMagicProjectionCost(definedMagicProjection)
      const addedZeonCost = { value: +defensiveExpertise, pool: zeonPoolCost }
      const spellCasting = await actor.mysticCanCastEvaluate(spellID, spellGrade, addedZeonCost, { innate, prepared }, override);
      spellCasting.casted = { innate, prepared };
      if (actor.evaluateCast(spellCasting)) {
        return;
      }
      let metamagics = {
        defensiveExpertise,
        definedMagicProjection
      };
      if (prepared) {
        const preparedSpell = actor.getPreparedSpell(spellID, spellGrade)
        metamagics = mergeObject(metamagics, preparedSpell.system?.metamagics)
      }
      actor.mysticCast(spellCasting, spellID, spellGrade);
      actor.newSupernaturalShield(
        'mystic',
        {},
        0,
        spell,
        spellGrade,
        metamagics
      );
    } else if (tab === 'psychic') {
      const powerID = results['new.psychicShield.id'];
      const eliminateFatigue = results['new.psychicShield.eliminateFatigue'];
      const mentalPatternImbalance = results['new.psychicShield.mentalPatternImbalance'];
      const showRoll = true;
      let powerDifficulty = results['new.psychicShield.difficulty'];
      const power = actor.system.psychic.psychicPowers.find(i => i._id === powerID);
      if (!power) {
        return;
      }
      if (powerDifficulty === 'roll') {
        const { i18n } = game;
        const mod = await openModDialog();
        const psychicPotential = actor.system.psychic.psychicPotential.final.value;
        const psychicPotentialRoll = new ABFFoundryRoll(
          `1d100PsychicRoll + ${psychicPotential} + ${mod}`,
          { ...actor.system, power, mentalPatternImbalance }
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
          eliminateFatigue,
          showRoll
        );
        if (fatigue) {
          return;
        }
      }
      actor.newSupernaturalShield(
        'psychic',
        power,
        powerDifficulty
      );
    }
  }
});
