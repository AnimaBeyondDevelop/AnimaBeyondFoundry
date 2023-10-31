import { ABFItems } from '../../items/ABFItems';
import { openComplexInputDialog } from '../../utils/dialogs/openComplexInputDialog';
import { SpellGrades } from './SpellItemConfig';
import { ABFItemConfigFactory } from '../ABFItemConfig';
import { mysticSpellCastEvaluate } from '../../combat/utils/mysticSpellCastEvaluate.js';
import { evaluateCast } from '../../combat/utils/evaluateCast.js';
import { shieldValueCheck } from '../../combat/utils/shieldValueCheck.js';
import { executeArgsMacro } from '../../utils/functions/executeArgsMacro';
import { mysticCast } from '../../utils/functions/mysticCast';

/**
 * Initial data for a new mystic shield. Used to infer the type of the data inside `mysticShield.system`
 * @readonly
 */
export const INITIAL_MYSTIC_SHIELD_DATA = {
  grade: { value: SpellGrades.BASE },
  damageBarrier: { value: 0 },
  shieldPoints: { value: 0 }
};

/** @type {import("../Items").MysticShieldItemConfig} */
export const MysticShieldItemConfig = ABFItemConfigFactory({
  type: ABFItems.MYSTIC_SHIELD,
  isInternal: false,
  fieldPath: ['mystic', 'mysticShields'],
  selectors: {
    addItemButtonSelector: 'add-mystic-shield',
    containerSelector: '#mystic-shields-context-menu-container',
    rowSelector: '.mystic-shield-row'
  },
  onCreate: async actor => {
    const results = await openComplexInputDialog(actor, 'newMysticShield');
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
    actor.setFlag('animabf', `spellCastingOverride`, override);
    const mysticSpellCheck = mysticSpellCastEvaluate(actor, spell, spellGrade);
    const spellCasting = {
      zeon: { accumulated: 0, cost: 0 },
      spell: mysticSpellCheck,
      cast: { prepared, innate },
      override: { value: override }
    };
    spellCasting.zeon.accumulated = actor.system.mystic.zeon.accumulated.value ?? 0;
    spellCasting.zeon.cost = spell?.system.grades[spellGrade].zeon.value;
    const evaluateCastMsj = evaluateCast(spellCasting);
    if (evaluateCastMsj !== undefined) {
      return evaluateCastMsj;
    }
    const name = spell.name;
    mysticCast(actor, spellCasting, name, spellGrade);
    const shieldPoints = shieldValueCheck(
      spell.system.grades[spellGrade].description.value
    )[0];

    await actor.createItem({
      name,
      type: ABFItems.MYSTIC_SHIELD,
      system: {
        grade: { value: spellGrade },
        damageBarrier: { value: 0 },
        shieldPoints: { value: shieldPoints }
      }
    });
    setTimeout(() => {
      let supShields = actor.system.mystic.mysticShields;
      let shieldId = supShields[supShields.length - 1]._id;
      let args = {
        thisActor: actor,
        newShield: true,
        shieldId
      };
      executeArgsMacro(name, args);
    }, 100);
  }
});
