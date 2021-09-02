import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openDialog } from '../../utils/openDialog';
import { ABFItemConfig, ItemChanges } from '../Items';

export enum WeaponCritic {
  NONE = '-',
  CUT = 'cut',
  IMPACT = 'impact',
  THRUST = 'thrust',
  HEAT = 'heat',
  ELECTRICITY = 'electricity',
  COLD = 'cold',
  ENERGY = 'energy'
}

export enum ManageabilityType {
  ONE_HAND = 'one_hand',
  TWO_HAND = 'two_hands',
  ONE_OR_TWO_HAND = 'one_or_two_hands'
}

export enum ShotType {
  SHOT = 'shot',
  THROW = 'throw'
}

export type WeaponItemData = {
  special: { value: string };
  integrity: { value: number };
  breaking: { value: number };
  attack: { value: number };
  block: { value: number };
  damage: {
    base: { value: number };
    final: { value: number };
  };
  initiative: {
    base: { value: number };
    final: { value: number };
  };
  presence: { value: number };
  size: { value: number };
  strRequired: {
    oneHand: { value: number };
    twoHands: { value: number };
  };
  quality: { value: number };
  oneOrTwoHanded: { value: string };
  knowledgeType: { value: string };
  manageabilityType: { value: ManageabilityType };
  shotType: { value: ShotType };
  isRanged: { value: boolean };
  range: {
    base: { value: number };
    final: { value: number };
  };
  cadence: { value: string };
  reload: { value: number };
  weaponFue: { value: number };
  critic: {
    primary: { value: WeaponCritic };
    secondary: { value: WeaponCritic };
  };
};

export type WeaponDataSource = ABFItemBaseDataSource<ABFItems.WEAPON, WeaponItemData>;

export type WeaponChanges = ItemChanges<WeaponItemData>;

export const WeaponItemConfig: ABFItemConfig<WeaponDataSource, WeaponChanges> = {
  type: ABFItems.WEAPON,
  isInternal: false,
  hasSheet: true,
  fieldPath: ['combat', 'weapons'],
  getFromDynamicChanges: changes => {
    return changes.data.dynamic.weapons as WeaponChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-weapon',
    containerSelector: '#weapons-context-menu-container',
    rowSelector: '.weapon-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openDialog<string>({
      content: i18n.localize('dialogs.items.weapons.content')
    });

    const itemData: Omit<WeaponDataSource, '_id'> = {
      name,
      type: ABFItems.WEAPON,
      data: {
        special: { value: '' },
        integrity: { value: 0 },
        breaking: { value: 0 },
        attack: { value: 0 },
        block: { value: 0 },
        damage: {
          base: { value: 0 },
          final: { value: 0 }
        },
        initiative: {
          base: { value: 0 },
          final: { value: 0 }
        },
        presence: { value: 0 },
        size: { value: 0 },
        strRequired: {
          oneHand: { value: 0 },
          twoHands: { value: 0 }
        },
        quality: { value: 0 },
        oneOrTwoHanded: { value: '' },
        knowledgeType: { value: '' },
        manageabilityType: { value: ManageabilityType.ONE_HAND },
        shotType: { value: ShotType.SHOT },
        isRanged: { value: false },
        cadence: { value: '' },
        range: {
          base: { value: 0 },
          final: { value: 0 }
        },
        reload: { value: 0 },
        weaponFue: { value: 0 },
        critic: {
          primary: { value: WeaponCritic.NONE },
          secondary: { value: WeaponCritic.NONE }
        }
      }
    };

    await actor.createItem(itemData);
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      actor.updateItem({
        id,
        name,
        data
      });
    }
  },
  onAttach: (data, item) => {
    const items = data.combat.weapons as WeaponDataSource[];

    if (items) {
      const itemIndex = items.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      } else {
        items.push(item);
      }
    } else {
      (data.combat.weapons as WeaponDataSource[]) = [item];
    }
  }
};
