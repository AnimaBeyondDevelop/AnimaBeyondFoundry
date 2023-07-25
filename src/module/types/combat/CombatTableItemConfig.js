import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").CombatTableItemConfig} */
export const CombatTableItemConfig = ABFItemConfigFactory({
  type: ABFItems.COMBAT_TABLE,
  isInternal: true,
  fieldPath: ['combat', 'combatTables'],
  selectors: {
    addItemButtonSelector: 'add-combat-table',
    containerSelector: '#combat-tables-context-menu-container',
    rowSelector: '.combat-table-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.combatTable.content')
    });

    await actor.createInnerItem({
      name,
      type: ABFItems.COMBAT_TABLE
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      actor.updateInnerItem({
        id,
        type: ABFItems.COMBAT_TABLE,
        name
      });
    }
  },
});
