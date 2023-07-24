import { ABFItemBaseDataSource } from '../../../animabf.types';
import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigMinimal, ItemChanges } from '../Items';
import { mutateWeapon } from '../../items/utils/prepareItem/items/mutateWeapon';
import { normalizeItem } from '../../actor/utils/prepareActor/utils/normalizeItem';

export enum WeaponEquippedHandType {
  ONE_HANDED = 'one-handed',
  TWO_HANDED = 'two-handed'
}

export enum WeaponKnowledgeType {
  KNOWN = 'known',
  SIMILAR = 'similar',
  MIXED = 'mixed',
  DIFFERENT = 'different'
}

export enum WeaponCritic {
  CUT = 'cut',
  IMPACT = 'impact',
  THRUST = 'thrust',
  HEAT = 'heat',
  ELECTRICITY = 'electricity',
  COLD = 'cold',
  ENERGY = 'energy'
}

export enum NoneWeaponCritic {
  NONE = '-'
}

export type OptionalWeaponCritic = WeaponCritic | NoneWeaponCritic;

export enum WeaponManageabilityType {
  ONE_HAND = 'one_hand',
  TWO_HAND = 'two_hands',
  ONE_OR_TWO_HAND = 'one_or_two_hands'
}

export enum WeaponShotType {
  SHOT = 'shot',
  THROW = 'throw'
}

export enum WeaponSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  BIG = 'big'
}

export enum WeaponSizeProportion {
  NORMAL = 'normal',
  ENORMOUS = 'enormous',
  GIANT = 'giant'
}

export type WeaponItemData = any;

export type WeaponDataSource = ABFItemBaseDataSource<ABFItems.WEAPON, WeaponItemData>;

export type WeaponChanges = ItemChanges<WeaponItemData>;

export const INITIAL_WEAPON_DATA: WeaponItemData = {
  equipped: { value: false },
  isShield: { value: false },
  special: { value: '' },
  hasOwnStr: { value: false },
  integrity: {
    base: { value: 0 },
    final: { value: 0 }
  },
  breaking: {
    base: { value: 0 },
    final: { value: 0 }
  },
  attack: {
    special: { value: 0 },
    final: { value: 0 }
  },
  block: {
    special: { value: 0 },
    final: { value: 0 }
  },
  damage: {
    base: { value: 0 },
    final: { value: 0 }
  },
  initiative: {
    base: { value: 0 },
    final: { value: 0 }
  },
  presence: {
    base: { value: 0 },
    final: { value: 0 }
  },
  size: { value: WeaponSize.MEDIUM },
  sizeProportion: { value: WeaponSizeProportion.NORMAL },
  strRequired: {
    oneHand: {
      base: { value: 0 },
      final: { value: 0 }
    },
    twoHands: {
      base: { value: 0 },
      final: { value: 0 }
    }
  },
  quality: { value: 0 },
  oneOrTwoHanded: { value: WeaponEquippedHandType.ONE_HANDED },
  knowledgeType: { value: WeaponKnowledgeType.KNOWN },
  manageabilityType: { value: WeaponManageabilityType.ONE_HAND },
  shotType: { value: WeaponShotType.SHOT },
  isRanged: { value: false },
  cadence: { value: '' },
  range: {
    base: { value: 0 },
    final: { value: 0 }
  },
  reload: {
    base: { value: 0 },
    final: { value: 0 }
  },
  weaponStrength: {
    base: { value: 0 },
    final: { value: 0 }
  },
  critic: {
    primary: { value: WeaponCritic.CUT },
    secondary: { value: NoneWeaponCritic.NONE }
  }
};

export const WeaponItemConfig: ABFItemConfigMinimal<WeaponDataSource, WeaponChanges> = {
  type: ABFItems.WEAPON,
  isInternal: false,
  hasSheet: true,
  defaultValue: INITIAL_WEAPON_DATA,
  fieldPath: ['combat', 'weapons'],
  getFromDynamicChanges: changes => {
    return changes.system.dynamic.weapons as WeaponChanges;
  },
  selectors: {
    addItemButtonSelector: 'add-weapon',
    containerSelector: '#weapons-context-menu-container',
    rowSelector: '.weapon-row'
  },
  onCreate: async (actor): Promise<void> => {
    const { i18n } = game as Game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.weapons.content')
    });

    const itemData: any = {
      name,
      type: ABFItems.WEAPON,
      system: INITIAL_WEAPON_DATA
    };

    await actor.createItem(itemData);
  },
  onUpdate: async (actor, changes): Promise<void> => {
    for (const id of Object.keys(changes)) {
      const { name, system } = changes[id];

      actor.updateItem({
        id,
        name,
        system
      });
    }
  },
  prepareItem(data) {
    mutateWeapon(data);
  }
};
