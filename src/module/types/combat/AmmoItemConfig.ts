import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfig, DerivedField, ItemChanges } from '../Items';
import { WeaponCritic } from './WeaponItemConfig';
import { normalizeItem } from '../../actor/utils/prepareActor/utils/normalizeItem';

export type AmmoItemData = {
  amount: { value: number };
  damage: DerivedField;
  critic: { value: WeaponCritic };
  integrity: DerivedField;
  breaking: DerivedField;
  presence: DerivedField;
  quality: { value: number };
  special: { value: string };
};

export type AmmoDataSource = any;

export type AmmoChanges = ItemChanges<AmmoItemData>;

export const INITIAL_AMMO_DATA: AmmoItemData = {
  amount: { value: 0 },
  damage: {
    base: { value: 0 },
    final: { value: 0 }
  },
  critic: { value: WeaponCritic.CUT },
  quality: { value: 0 },
  integrity: {
    base: { value: 0 },
    final: { value: 0 }
  },
  breaking: {
    base: { value: 0 },
    final: { value: 0 }
  },
  presence: {
    base: { value: 0 },
    final: { value: 0 }
  },
  special: { value: '' }
};

export const AmmoItemConfig: ABFItemConfig<AmmoDataSource, AmmoChanges> = {
  type: ABFItems.AMMO,
  isInternal: false,
  defaultValue: INITIAL_AMMO_DATA,
  hasSheet: true,
  fieldPath: ['combat', 'ammo'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.ammo as AmmoChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-ammo',
    containerSelector: '#ammo-context-menu-container',
    rowSelector: '.ammo-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.ammo.content')
    });

    const itemData: any = {
      name,
      type: ABFItems.AMMO,
      system: INITIAL_AMMO_DATA
    };

    await actor.createItem(itemData);
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      actor.updateItem({
        id,
        name,
        system: data
      });
    }
  },
};
