import { ABFItems } from '../../items/ABFItems';
import { SpellGrades } from './SpellItemConfig';
import { openComplexInputDialog } from '../../utils/dialogs/openComplexInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * Initial data for a new maintained spell. Used to infer the type of the data inside `maintainedSpell.system`
 * @readonly
 */
export const INITIAL_MAINTAINED_SPELL_DATA = {
  grade: { value: SpellGrades.BASE },
  maintenanceCost: { value: 0 },
  via: { value: '' },
  innate: false,
  active: true
};

/** @type {import("../Items").MaintainedSpellItemConfig} */
export const MaintainedSpellItemConfig = ABFItemConfigFactory({
  type: ABFItems.MAINTAINED_SPELL,
  isInternal: true,
  fieldPath: ['mystic', 'maintainedSpells'],
  selectors: {
    addItemButtonSelector: 'add-maintained-spell',
    containerSelector: '#maintained-spells-context-menu-container',
    rowSelector: '.maintained-spell-row'
  },
  onCreate: async actor => {
    const results = await openComplexInputDialog(actor, 'newMaintainedSpell');
    const spellID = results['new.maintainedSpell.id'];
    const spellGrade = results['new.maintainedSpell.grade'];
    const innate = results['new.maintainedSpell.innate'];
    const spell = actor.system.mystic.spells.find(i => i._id === spellID);
    if (!spell) {
      return;
    }
    const name = spell.name;
    const maintenanceCost = parseInt(spell.system.grades[spellGrade].maintenanceCost.value);
    const via = spell.system.via.value

    await actor.createInnerItem({
      name,
      type: ABFItems.MAINTAINED_SPELL,
      system: {
        grade: { value: spellGrade },
        maintenanceCost: { value: maintenanceCost },
        via: { value: via },
        innate,
        active: true
      }
    });
  }
});
