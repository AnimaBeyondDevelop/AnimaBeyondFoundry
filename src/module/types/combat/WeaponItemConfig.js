import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { mutateWeapon } from '../../items/utils/prepareItem/items/mutateWeapon';
import { ABFItemConfigFactory } from '../ABFItemConfig';
import { CriticType, NoneCriticType } from './CriticType';

/**
 * @readonly
 * @enum {string}
 */
export const WeaponEquippedHandType = /** @type {const} */ ({
  ONE_HANDED: 'one-handed',
  TWO_HANDED: 'two-handed'
});

/**
 * @readonly
 * @enum {string}
 */
export const WeaponKnowledgeType = /** @type {const} */ ({
  KNOWN: 'known',
  SIMILAR: 'similar',
  MIXED: 'mixed',
  DIFFERENT: 'different'
});

/**
 * @readonly
 * @enum {string}
 */
export const WeaponManageabilityType = /** @type {const} */ ({
  ONE_HAND: 'one_hand',
  TWO_HAND: 'two_hands',
  ONE_OR_TWO_HAND: 'one_or_two_hands'
});

/**
 * @readonly
 * @enum {string}
 */
export const WeaponShotType = /** @type {const} */ ({
  SHOT: 'shot',
  THROW: 'throw'
});

/**
 * @readonly
 * @enum {string}
 */
export const WeaponSize = /** @type {const} */ ({
  SMALL: 'small',
  MEDIUM: 'medium',
  BIG: 'big'
});

/**
 * @readonly
 * @enum {string}
 */
export const WeaponSizeProportion = /** @type {const} */ ({
  NORMAL: 'normal',
  ENORMOUS: 'enormous',
  GIANT: 'giant'
});

/**
 * Initial data for a new weapon. Used to infer the type of the data inside `weapon.system`
 * @readonly
 */
export const INITIAL_WEAPON_DATA = {
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
    primary: { value: CriticType.CUT },
    secondary: { value: NoneCriticType.NONE }
  }
};

/** @type {import("../Items").WeaponItemConfig} */
export const WeaponItemConfig = ABFItemConfigFactory({
  type: ABFItems.WEAPON,
  isInternal: false,
  hasSheet: true,
  defaultValue: INITIAL_WEAPON_DATA,
  fieldPath: ['combat', 'weapons'],
  selectors: {
    addItemButtonSelector: 'add-weapon',
    containerSelector: '#weapons-context-menu-container',
    rowSelector: '.weapon-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.weapons.content')
    });

    const itemData = {
      name,
      type: ABFItems.WEAPON,
      system: INITIAL_WEAPON_DATA
    };

    await actor.createItem(itemData);
  },
  onAttach: async (actor, weapon) => {
    if (
      weapon.system.isRanged &&
      typeof weapon.system.ammoId === 'string' &&
      !!weapon.system.ammoId
    ) {
      const {
        system: {
          combat: { ammo }
        }
      } = actor;

      weapon.system.ammo = ammo.find(i => i._id === weapon.system.ammoId);
    }
  },
  prepareItem(data) {
    mutateWeapon(data);
  }
});
