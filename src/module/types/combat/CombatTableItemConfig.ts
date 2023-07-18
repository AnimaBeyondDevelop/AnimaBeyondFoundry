import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';
import { ABFItemBaseDataSource } from '../../../animabf.types';

export type CombatTableItemData = Record<string, never>;

export type CombatTableDataSource = ABFItemBaseDataSource<
  ABFItems.COMBAT_TABLE,
  CombatTableItemData
>;

export type CombatTableChanges = ItemChanges<CombatTableItemData>;

export const CombatTableItemConfig: ABFItemConfigMinimal<
  CombatTableDataSource,
  CombatTableChanges
> = {
  type: ABFItems.COMBAT_TABLE,
  isInternal: true,
  fieldPath: ['combat', 'combatTables'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.combatTables as CombatTableChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-combat-table',
    containerSelector: '#combat-tables-context-menu-container',
    rowSelector: '.combat-table-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.combatTable.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.COMBAT_TABLE
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      actor.updateInnerItem({
        id,
        type: ABFItems.COMBAT_TABLE,
        name
      });
    }
  },
};
