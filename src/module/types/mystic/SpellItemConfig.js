import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { NoneWeaponCritic } from '../combat/WeaponItemConfig.js';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * An object that contains information about the zeon points, whether the spell can be cast (prepared or innate), if and how the spell has been casted, and whether the casting rules should be overridden.
 * @typedef {object} SpellCasting
 * @property {{ value: number, accumulated: number, cost: number, poolCost: number }} zeon - An object with properties `accumulated` (chacater accumulated zeon) and `cost` (zeon spell cost).
 * @property {{ prepared: boolean, innate: boolean }} canCast - An object that indicates whether the spell can be cast, either as a prepared spell or an innate spell.
 * @property {{ prepared: boolean, innate: boolean }} casted - An object that indicates whether the spell has been casted before, either as a prepared spell or an innate spell.
 * @property {boolean} override - A flag that indicates whether to override the normal casting rules and allow the spell to be casted regardless of zeon points or previous casting.
 */
export const SpellCasting = {
  zeon: { value: 0, accumulated: 0, cost: 0, poolCost: 0 },
  canCast: { prepared: false, innate: false },
  casted: { prepared: false, innate: false },
  override: false
};
/**
 * @readonly
 * @enum {string}
 */
export const SpellGrades = {
  BASE: 'base',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  ARCANE: 'arcane'
};
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
  description: { value: '' },
  level: { value: 0 },
  via: { value: '' },
  hasDailyMaintenance: { value: false },
  visible: false,
  critic: { value: NoneWeaponCritic.NONE },
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
  },
  prepareItem: async item => {
    item.system.enrichedDescription = await TextEditor.enrichHTML(
      item.system.description?.value ?? '',
      { async: true }
    );
  }
});
