import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/**
 * @readonly
 * @enum {string}
 */
const SpellGradeNames = {
  BASE: 'anima.ui.mystic.spell.grade.base.title',
  INTERMEDIATE: 'anima.ui.mystic.spell.grade.intermediate.title',
  ADVANCED: 'anima.ui.mystic.spell.grade.advanced.title',
  ARCANE: 'anima.ui.mystic.spell.grade.arcane.title'
};

/** @type {import("../Items").SpellItemConfig} */
export const SpellItemConfig = ABFItemConfigFactory({
  type: ABFItems.SPELL,
  isInternal: false,
  hasSheet: true,
  fieldPath: ['mystic', 'spells'],
  selectors: {
    addItemButtonSelector: 'add-spell',
    containerSelector: '#spells-context-menu-container',
    rowSelector: '.spell-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.spell.content')
    });

    const InitialData = {
      description: { value: '' },
      level: { value: 0 },
      via: { value: '' },
      hasDailyMaintenance: { value: false },
      spellType: { value: '' },
      actionType: { value: '' },
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
    const itemCreateData = {
      name,
      type: ABFItems.SPELL,
      ...InitialData, // NOTE: (AB) Why do we have this repeated? (see `ABFItemBaseDataSource`)
      system: InitialData
    };

    await actor.createItem(itemCreateData);
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name, system } = changes[id];

      await actor.updateItem({
        id,
        name,
        system
      });
    }
  }
});
