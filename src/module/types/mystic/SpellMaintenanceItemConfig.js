import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").SpellMaintenanceItemConfig} */
export const SpellMaintenanceItemConfig = ABFItemConfigFactory({
  type: ABFItems.SPELL_MAINTENANCE,
  isInternal: true,
  fieldPath: ['mystic', 'spellMaintenances'],
  selectors: {
    addItemButtonSelector: 'add-spell-maintenance',
    containerSelector: '#spell-maintenances-context-menu-container',
    rowSelector: '.spell-maintenance-row'
  },
  onCreate: async (actor) => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.spellMaintenance.content')
    });

    actor.createInnerItem({
      type: ABFItems.SPELL_MAINTENANCE,
      name,
      system: { cost: { value: 0 } }
    });
  },
  onUpdate: async (actor, changes) => {
    for (const id of Object.keys(changes)) {
      const { name, system } = changes[id];

      actor.updateInnerItem({
        type: ABFItems.SPELL_MAINTENANCE,
        id,
        name,
        system
      });
    }
  },
});
