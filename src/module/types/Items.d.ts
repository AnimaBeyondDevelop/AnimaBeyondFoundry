import { ABFItems } from '../items/ABFItems';
import { ABFActor } from '../actor/ABFActor';
import { ABFActorDataSourceData } from './Actor';
import ABFItem from '../items/ABFItem';

export type ABFItemConfigMinimal<D, C> = {
  /**
   * The type of the item
   */
  type: ABFItems,

  /**
   * The default value for `item.system` when created from scratch
   */
  defaultValue?: D,

  /**
   * Items can be external or internals
   * External items could be exported to compendiums to be reused by other actors, like weapons that can be used the same sword for different actors
   * Internal items are actor's exclusive, like new secondary skills that each new actor has different values on it
   */
  isInternal: boolean,

  /**
   * Indicate if the item has sheet to be edited
   */
  hasSheet?: boolean,

  /**
   * Path where the item are located inside actor data, for example:
   * In system.combat.weapons are located the weapons
   * This field value must be: ['combat', 'weapons']
   */
  fieldPath: string[],

  /**
   * This function must return the value of the changes inside dynamic object.
   * To understand better this field I recommend to see what other items configs does.
   * @param changes
   */
  getFromDynamicChanges: (changes: DynamicChanges) => C,

  /**
   * This configuration will be used to interact with the elements of the item in the templates
   */
  selectors: {
    /**
     * The id of the button that will execute the creation of the new item
     */
    addItemButtonSelector: string,

    /**
     * The id of the container that will locate all the items in the template
     */
    containerSelector: string,

    /**
     * CSS class of each row that locate one single item
     */
    rowSelector: string,
  },

  /**
   * Method called to create a new item
   * @param actor
   * @param otherArgs
   */
  async onCreate: (actor: ABFActor, ...otherArgs: unknown[]) => Promise<void>,

  /**
   * Method to update an item
   * @param actor
   * @param changes
   * @param otherArgs
   */
  async onUpdate: (actor: ABFActor, changes: C) => Promise<void>,

  /**
   * Method that mutates the data to insert a new item
   * @param data
   * @param item
   * @param otherArgs
   */
  async onAttach?: (data: ABFActor, item: D, ...otherArgs: unknown[]) => void,

  /**
   * Extra configuration for contextual menu
   */
  contextMenuConfig?: {
    /**
     * Custom message for item deletion row
     */
    customDeleteRowMessage?: string,

    /**
     * Function that allows to create new items in the contextual menu
     * @param actor
     */
    buildExtraOptionsInContextMenu?: (actor: ABFActor) => ContextMenuEntry[],
  },

  /**
   * Custom method to delete an item
   * @param actor
   * @param target
   */
  onDelete?: (actor: ABFActor, target: JQuery) => void,

  /**
   * Method to calculate derived data
   * @param data
   */
  prepareItem?: (data: ABFItem) => void,
};

export type ABFItemConfig<D, C> = ABFItemConfigMinimal<D,C> & {
  /**
   * This function clears the path where this type of Items is stored for a given actor, setting it to an empty array.
   * @param actor
   */
  clearFieldPath: (actor: ABFActor) => void,
  /**
   * This function adds an item to the path where this type of Items is stored for a given actor.
   * @param actor
   * @param item
   */
  addToFieldPath: (actor: ABFActor, item: D) => void,
  /**
   * This function reloads the items of this type into `actor`'s fieldPath.
   * If defined, it will run `.onAttach()` before attaching the item and `.prepareItem()` after attachment.
   * @param {ABFActor} actor
   */
  async resetFieldPath: (actor: ABFActor) => void
};

export type ItemChanges<T = undefined> = {
  [id: string]: {
    name: string;
    data: T;
  };
};

export type DynamicChanges = {
  data: {
    dynamic: {
      [key: string]: unknown;
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
