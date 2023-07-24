import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';

export type SpellMaintenanceItemData = {
  cost: { value: number };
};

export type SpellMaintenanceDataSource = ABFItemBaseDataSource<
  ABFItems.SPELL_MAINTENANCE,
  SpellMaintenanceItemData
>;

export type SpellMaintenanceChanges = ItemChanges<SpellMaintenanceItemData>;

export const SpellMaintenanceItemConfig: ABFItemConfigMinimal<
  SpellMaintenanceDataSource,
  SpellMaintenanceChanges
> = {
  type: ABFItems.SPELL_MAINTENANCE,
  isInternal: true,
  fieldPath: ['mystic', 'spellMaintenances'],
  getFromDynamicChanges: changes => {
    return changes.system.dynamic.spellMaintenances as SpellMaintenanceChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-spell-maintenance',
    containerSelector: '#spell-maintenances-context-menu-container',
    rowSelector: '.spell-maintenance-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.spellMaintenance.content')
    });

    actor.createInnerItem({
      type: ABFItems.SPELL_MAINTENANCE,
      name,
      system: { cost: { value: 0 } }
    });
  },
  onUpdate: async (actor, changes): Promise<void> => {
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
};
