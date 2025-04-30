import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { NoneCriticType } from '../combat/CriticType';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * @enum {string}
 */
export const SpellGrades = /** @type {const} */ ({
  BASE: 'base',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  ARCANE: 'arcane'
});
/**
 * @readonly
 * @enum {string}
 */
export const SpellGradeNames = {
  BASE: 'anima.ui.mystic.spell.grade.base.title',
  INTERMEDIATE: 'anima.ui.mystic.spell.grade.intermediate.title',
  ADVANCED: 'anima.ui.mystic.spell.grade.advanced.title',
  ARCANE: 'anima.ui.mystic.spell.grade.arcane.title'
};
export const INITIAL_MYSTIC_SPELL_DATA = {
  description: '',
  level: { value: 0 },
  via: { value: '' },
  hasDailyMaintenance: { value: false },
  visible: false,
  critic: { value: NoneCriticType.NONE },
  spellType: { value: '' },
  actionType: { value: '' },
  combatType: { value: '' },
  macro: '',
  grades: {
    base: {
      name: { value: SpellGradeNames.BASE },
      intRequired: { value: 0 },
      maintenanceCost: { value: 0 },
      zeon: { value: 0 },
      description: { value: '' }
    },
    intermediate: {
      name: { value: SpellGradeNames.INTERMEDIATE },
      intRequired: { value: 0 },
      maintenanceCost: { value: 0 },
      zeon: { value: 0 },
      description: { value: '' }
    },
    advanced: {
      name: { value: SpellGradeNames.ADVANCED },
      intRequired: { value: 0 },
      maintenanceCost: { value: 0 },
      zeon: { value: 0 },
      description: { value: '' }
    },
    arcane: {
      name: { value: SpellGradeNames.ARCANE },
      intRequired: { value: 0 },
      maintenanceCost: { value: 0 },
      zeon: { value: 0 },
      description: { value: '' }
    }
  }
};
/** @type {import("../Items").SpellItemConfig} */
export const SpellItemConfig = ABFItemConfigFactory({
  type: ABFItems.SPELL,
  isInternal: false,
  defaultValue: INITIAL_MYSTIC_SPELL_DATA,
  hasSheet: true,
  fieldPath: ['mystic', 'spells'],
  selectors: {
    addItemButtonSelector: 'add-spell',
    containerSelector: '#spells-context-menu-container',
    rowSelector: '.spell-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.spell.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.SPELL,
      system: INITIAL_MYSTIC_SPELL_DATA
    });
  }
  // prepareItem: async item => {
  //   item.system.enrichedDescription = await TextEditor.enrichHTML(
  //     item.system.description?.value ?? '',
  //     { async: true }
  //   );
  // }
});
