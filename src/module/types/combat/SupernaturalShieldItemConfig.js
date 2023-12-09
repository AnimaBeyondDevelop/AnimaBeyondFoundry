import { ABFItems } from '../../items/ABFItems';
import { openComplexInputDialog } from '../../utils/dialogs/openComplexInputDialog';
import { openModDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { SpellGrades } from '../mystic/SpellItemConfig';
import { ABFItemConfigFactory } from '../ABFItemConfig';
import { mysticCanCastEvaluate } from '../../combat/utils/mysticCanCastEvaluate.js';
import { evaluateCast } from '../../combat/utils/evaluateCast.js';
import { mysticCast } from '../../utils/functions/mysticCast';

/**
 * Initial data for a new supernatural shield. Used to infer the type of the data inside `supernaturalShield.system`
 * @readonly
 */
export const INITIAL_SUPERNATURAL_SHIELD_DATA = {
  type: 'none',
  spellGrade: SpellGrades.BASE,
  damageBarrier: 0,
  shieldPoints: 0,
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
      const castSpell = results['new.mysticShield.castSpell'];
      const innate = castSpell == 'innate';
      const prepared = castSpell == 'prepared';
      const override = castSpell == 'override';
      const spell = actor.system.mystic.spells.find(i => i._id == spellID);
      if (!spell) {
        return;
      }
      actor.setFlag('animabf', 'spellCastingOverride', override);
      const canCast = mysticCanCastEvaluate(actor, spell, spellGrade);
      const spellCasting = {
        zeon: { accumulated: 0, cost: 0 },
        canCast,
        casted: { prepared, innate },
        override: { value: override }
      };
      spellCasting.zeon.accumulated = actor.system.mystic.zeon.accumulated.value ?? 0;
      spellCasting.zeon.cost = spell?.system.grades[spellGrade].zeon.value;
      if (evaluateCast(spellCasting)) {
        return;
      }
      mysticCast(actor, spellCasting, spell.name, spellGrade);
      actor.newSupernaturalShield(
        'mystic',
        {},
        0,
        spell,
        spellGrade
      );
    } else if (tab === 'psychic') {
      const powerID = results['new.psychicShield.id'];
      const showRoll = true;
      let powerDifficulty = results['new.psychicShield.difficulty'];
      const power = actor.system.psychic.psychicPowers.find(i => i._id == powerID);
      if (!power) {
        return;
      }
      if (powerDifficulty == 'roll') {
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
      actor.newSupernaturalShield(
        'psychic',
        power,
        powerDifficulty
      );
    }
  }
});
