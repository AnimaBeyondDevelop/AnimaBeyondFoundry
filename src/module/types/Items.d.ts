import { ABFItems } from '../items/ABFItems';
import { ABFActor } from '../actor/ABFActor';
import { ABFActorDataSourceData } from './Actor';
import ABFItem from '../items/ABFItem';
import { ABFItemBaseDataSource } from '../../animabf.types';
import { ABFItemConfigFactory } from './ABFItemConfig';

/**
 * @template TData - Type of the data inside the item's system attribute.
 * @template TChanges - Type of the item changes as returned by `.getFromDynamicChanges()`.
 * @template TDynamicChanges - Type of the dynamic changes as received by `.getFromDynamicChanges()`.
 */
export type ABFItemConfigMinimal<
  TData,
  TChanges = ItemChanges<TData>,
  TDynamicChanges = DynamicChanges<TChanges>
> = {
  /**
   * The type of the item
   */
  type: ABFItems;

  /**
   * The default value for `item.system` when created from scratch
   */
  defaultValue?: TData;

  /**
   * Items can be external or internals
   * External items could be exported to compendiums to be reused by other actors, like weapons that can be used the same sword for different actors
   * Internal items are actor's exclusive, like new secondary skills that each new actor has different values on it
   */
  isInternal: boolean;

  /**
   * Indicate if the item has sheet to be edited
   */
  hasSheet?: boolean;

  /**
   * Path where the item are located inside actor data, for example:
   * In system.combat.weapons are located the weapons
   * This field value must be: ['combat', 'weapons']
   */
  fieldPath: string[];

  /**
   * This function must return the value of the changes inside dynamic object.
   * To understand better this field I recommend to see what other items configs does.
   * @param changes
   */
  getFromDynamicChanges?: (changes: TDynamicChanges) => TChanges;

  /**
   * This configuration will be used to interact with the elements of the item in the templates
   */
  selectors: {
    /**
     * The id of the button that will execute the creation of the new item
     */
    addItemButtonSelector: string;

    /**
     * The id of the container that will locate all the items in the template
     */
    containerSelector: string;

    /**
     * CSS class of each row that locate one single item
     */
    rowSelector: string;
  };

  /**
   * Method called to create a new item
   * @param actor
   * @param otherArgs
   */
  onCreate: (actor: ABFActor, ...otherArgs: unknown[]) => Promise<void>;

  /**
   * Method to update an item
   * @param actor
   * @param changes
   * @param otherArgs
   */
  onUpdate: (actor: ABFActor, changes: TChanges) => Promise<void>;

  /**
   * Method that mutates the data to insert a new item
   * @param data
   * @param item
   * @param otherArgs
   */
  onAttach?: (data: ABFActor, item: TData, ...otherArgs: unknown[]) => void;

  /**
   * Extra configuration for contextual menu
   */
  contextMenuConfig?: {
    /**
     * Custom message for item deletion row
     */
    customDeleteRowMessage?: string;

    /**
     * Function that allows to create new items in the contextual menu
     * @param actor
     */
    buildExtraOptionsInContextMenu?: (actor: ABFActor) => ContextMenuEntry[];
  };

  /**
   * Custom method to delete an item
   * @param actor
   * @param target
   */
  onDelete?: (actor: ABFActor, target: JQuery) => void;

  /**
   * Method to calculate derived data
   * @param data
   */
  prepareItem?: (data: ABFItem) => void;

  /**
   * This function clears the path where this type of Items is stored for a given actor, setting it to an empty array.
   * @param actor
   */
  clearFieldPath?: (actor: ABFActor) => void;

  /**
   * This function adds an item to the path where this type of Items is stored for a given actor.
   * @param actor
   * @param item
   */
  addToFieldPath?: (actor: ABFActor, item: D) => void;

  /**
   * This function reloads the items of this type into `actor`'s fieldPath.
   * If defined, it will run `.onAttach()` before attaching the item and `.prepareItem()` after attachment.
   * @param {ABFActor} actor
   */
  resetFieldPath?: (actor: ABFActor) => void;
};

/**
 * Type mapping `T` into a similar type but with keys in `K` made mandatory/non-nullable.
 * For an example see {@link https://stackoverflow.com/a/69328045 this answer} and its comments.
 * @template T - The original type
 * @template K - A key (or a subset of keys) to be made mandatory
 */
type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * @template TData - Type of the data inside the item's system attribute.
 * @template TChanges - Type of the item changes as returned by `.getFromDynamicChanges()`.
 * @template TDynamicChanges - Type of the dynamic changes as received by `.getFromDynamicChanges()`.
 */
export type ABFItemConfig<
  TData,
  TChanges = ItemChanges<TData>,
  TDynamicChanges = DynamicChanges<TChanges>
> = WithRequired<
  ABFItemConfigMinimal<TData, TChanges, TDynamicChanges>,
  'getFromDynamicChanges' | 'clearFieldPath' | 'addToFieldPath' | 'resetFieldPath'
>;

export type ItemChanges<T> = {
  [id: string]: {
    name: string;
    system: T;
  };
};

export type DynamicChanges<TChanges> = {
  system: {
    dynamic: {
      [key: string]: TChanges;
    };
  };
};

export type DerivedField = {
  base: { value: number };
  final: { value: number };
};

export type SpecialField = {
  special: { value: number };
  final: { value: number };
};

// Specific ItemConfig types
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
export type AmmoDataSource = ABFItemBaseDataSource<ABFItems.AMMO, AmmoItemData>;
export type AmmoChanges = ItemChanges<AmmoItemData>;
export type AmmoItemConfig = ABFItemConfig<AmmoItemData, AmmoChanges>;

export type ArmorItemData = {
  cut: DerivedField;
  impact: DerivedField;
  thrust: DerivedField;
  heat: DerivedField;
  electricity: DerivedField;
  cold: DerivedField;
  energy: DerivedField;
  integrity: DerivedField;
  presence: DerivedField;
  wearArmorRequirement: DerivedField;
  movementRestriction: DerivedField;
  naturalPenalty: DerivedField;
  isEnchanted: { value: boolean };
  type: { value: ArmorType };
  localization: { value: ArmorLocation };
  quality: { value: number };
  equipped: { value: boolean };
};
export type ArmorDataSource = ABFItemBaseDataSource<ABFItems.ARMOR, ArmorItemData>;
export type ArmorChanges = ItemChanges<ArmorItemData>;
export type ArmorItemConfig = ABFItemConfig<ArmorItemData, ArmorChanges>;

export type ContactItemData = {
  description: { value: string };
};
export type ContactChanges = ItemChanges<ContactItemData>;
export type ContactDataSource = ABFItemBaseDataSource<ABFItems.CONTACT, ContactItemData>;
export type ContactItemConfig = ABFItemConfig<ContactItemData>;

export type CombatSpecialSkillItemData = Record<string, never>;
export type CombatSpecialSkillDataSource = ABFItemBaseDataSource<
  ABFItems.COMBAT_SPECIAL_SKILL,
  CombatSpecialSkillItemData
>;
export type CombatSpecialSkillChanges = ItemChanges<CombatSpecialSkillItemData>;
export type CombatSpecialSkillItemConfig = ABFItemConfig<CombatSpecialSkillItemData>;

export type CombatTableItemData = Record<string, never>;
export type CombatTableDataSource = ABFItemBaseDataSource<
  ABFItems.COMBAT_TABLE,
  CombatTableItemData
>;
export type CombatTableChanges = ItemChanges<CombatTableItemData>;
export type CombatTableItemConfig = ABFItemConfig<CombatTableItemData>;
