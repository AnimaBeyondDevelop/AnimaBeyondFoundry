import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

enum SpellGradeNames {
  BASE = 'anima.ui.mystic.spell.grade.base.title',
  INTERMEDIATE = 'anima.ui.mystic.spell.grade.intermediate.title',
  ADVANCED = 'anima.ui.mystic.spell.grade.advanced.title',
  ARCANE = 'anima.ui.mystic.spell.grade.arcane.title'
}

export type SpellGrade = {
  name: { value: SpellGradeNames };
  intRequired: { value: number };
  zeon: { value: number };
  maintenanceCost: { value: number };
  description: { value: string };
};

export type SpellItemData = {
  level: { value: number };
  via: { value: string };
  spellType: { value: string };
  actionType: { value: string };
  hasDailyMaintenance: { value: boolean };
  grades: {
    base: SpellGrade;
    intermediate: SpellGrade;
    advanced: SpellGrade;
    arcane: SpellGrade;
  };
};

export type SpellDataSource = ABFItemBaseDataSource<ABFItems.SPELL, SpellItemData>;

export type SpellChanges = ItemChanges<SpellItemData>;

export const SpellItemConfig: ABFItemConfig<SpellDataSource, SpellChanges> = {
  type: ABFItems.SPELL,
  isInternal: false,
  hasSheet: true,
  fieldPath: ['mystic', 'spells'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.spells as SpellChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-spell',
    containerSelector: '#spells-context-menu-container',
    rowSelector: '.spell-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog<string>({
      content: i18n.localize('dialogs.items.spell.content')
    });

    const itemCreateData: Omit<SpellDataSource, '_id'> = {
      name,
      type: ABFItems.SPELL,
      data: {
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
      }
    };

    await actor.createItem(itemCreateData);
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      await actor.updateItem({ id, name, data });
    }
  },
  onAttach: (data, item) => {
    const items = data.mystic.spells as SpellDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.mystic.spells as SpellDataSource[]) = [item];
    }
  }
};
