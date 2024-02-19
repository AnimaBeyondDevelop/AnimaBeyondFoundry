import { ABFItems } from '../items/ABFItems';
import { ABFActor } from '../actor/ABFActor';
import { ABFActorDataSourceData } from './Actor';
import ABFItem from '../items/ABFItem';
import { ABFItemBaseDataSource } from '../../animabf.types';
import { ABFItemConfigFactory } from './ABFItemConfig';
import { INITIAL_WEAPON_DATA } from './combat/WeaponItemConfig';
import { INITIAL_ARMOR_DATA } from './combat/ArmorItemConfig';
import { INITIAL_SUPERNATURAL_SHIELD_DATA } from './combat/SupernaturalShieldItemConfig';
import { INITIAL_ACT_VIA_DATA } from './mystic/ActViaItemConfig';
import { INITIAL_INNATE_MAGIC_VIA_DATA } from './mystic/InnateMagicViaItemConfig';
import { INITIAL_MYSTIC_SPELL_DATA } from './mystic/SpellItemConfig';
import { INITIAL_PREPARED_SPELL_DATA } from './mystic/PreparedSpellItemConfig';
import { INITIAL_MAINTAINED_SPELL_DATA } from './mystic/MaintainedSpellItemConfig';
import { INITIAL_PSYCHIC_DISCIPLINE_DATA } from './psychic/PsychicDisciplineItemConfig';
import { INITIAL_MENTAL_PATTERN_DATA } from './psychic/MentalPatternItemConfig';
import { INITIAL_PSYCHIC_POWER_DATA } from './psychic/PsychicPowerItemConfig';
import { INITIAL_TECHNIQUE_DATA } from './domine/TechniqueItemConfig';

/**
 * @template TData - Type of the data inside the item's system attribute.
 * @template TDataSource - Type of the item as returned by `actor.getItemsOf()`.
 * @template TChanges - Type of the item changes as returned by `.getFromDynamicChanges()`.
 * @template TDynamicChanges - Type of the dynamic changes as received by `.getFromDynamicChanges()`.
 */
export type ABFItemConfigMinimal<
  TData,
  TDataSource = ABFItemBaseDataSource<TData> | ABFItem,
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
   * Hides DeleteRow from contextMenuConfig
   */
  hideDeleteRow?: boolean;

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
  onAttach?: (data: ABFActor, item: TDataSource, ...otherArgs: unknown[]) => void;

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
   * @param item
   */
  prepareItem?: (item: TDataSource) => void;

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
  addToFieldPath?: (actor: ABFActor, item: TDatasource) => void;

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
 * @template TDataSource - Type of the item as returned by `actor.getItemsOf()`.
 * @template TChanges - Type of the item changes as returned by `.getFromDynamicChanges()`.
 * @template TDynamicChanges - Type of the dynamic changes as received by `.getFromDynamicChanges()`.
 */
export type ABFItemConfig<
  TData,
  TDataSource = ABFItemBaseDataSource<TData> | ABFItem,
  TChanges = ItemChanges<TData>,
  TDynamicChanges = DynamicChanges<TChanges>
> = WithRequired<
  ABFItemConfigMinimal<TData, TDataSource, TChanges, TDynamicChanges>,
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

export type SecondaryData = {
  base: { value: number };
  final: { value: number };
  attribute: { value: Attribute };
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
export type AmmoDataSource = ABFItemBaseDataSource<AmmoItemData>;
export type AmmoChanges = ItemChanges<AmmoItemData>;
export type AmmoItemConfig = ABFItemConfig<AmmoItemData>;

export type ArmorItemData = typeof INITIAL_ARMOR_DATA;

export type ArmorDataSource = ABFItemBaseDataSource<ArmorItemData>;
export type ArmorChanges = ItemChanges<ArmorItemData>;
export type ArmorItemConfig = ABFItemConfig<ArmorItemData>;

export type ContactItemData = {
  description: { value: string };
};
export type ContactChanges = ItemChanges<ContactItemData>;
export type ContactDataSource = ABFItemBaseDataSource<ContactItemData>;
export type ContactItemConfig = ABFItemConfig<ContactItemData>;

export type CombatSpecialSkillItemData = Record<string, never>;
export type CombatSpecialSkillDataSource =
  ABFItemBaseDataSource<CombatSpecialSkillItemData>;
export type CombatSpecialSkillChanges = ItemChanges<CombatSpecialSkillItemData>;
export type CombatSpecialSkillItemConfig = ABFItemConfig<CombatSpecialSkillItemData>;

export type CombatTableItemData = Record<string, never>;
export type CombatTableDataSource = ABFItemBaseDataSource<CombatTableItemData>;
export type CombatTableChanges = ItemChanges<CombatTableItemData>;
export type CombatTableItemConfig = ABFItemConfig<CombatTableItemData>;

// export type OptionalWeaponCritic = WeaponCritic | NoneWeaponCritic;
export type WeaponItemData = typeof INITIAL_WEAPON_DATA;

export type WeaponDataSource = ABFItemBaseDataSource<WeaponItemData>;
export type WeaponChanges = ItemChanges<WeaponItemData>;
export type WeaponItemConfig = ABFItemConfig<WeaponItemData>;

export type ArsMagnusItemData = Record<string, never>;
export type ArsMagnusDataSource = ABFItemBaseDataSource<ArsMagnusItemData>;
export type ArsMagnusChanges = ItemChanges<ArsMagnusItemData>;
export type ArsMagnusItemConfig = ABFItemConfig<ArsMagnusItemData>;

export type SupernaturalShieldItemData = typeof INITIAL_SUPERNATURAL_SHIELD_DATA;
export type SupernaturalShieldDataSource = ABFItemBaseDataSource<SupernaturalShieldItemData>;
export type SupernaturalShieldChanges = ItemChanges<SupernaturalShieldItemData>;
export type SupernaturalShieldItemConfig = ABFItemConfig<SupernaturalShieldItemData>;

export type CreatureItemData = {
  fire: { value: unknown };
  water: { value: unknown };
  earth: { value: unknown };
  wood: { value: unknown };
  metal: { value: unknown };
};
export type CreatureDataSource = ABFItemBaseDataSource<CreatureItemData>;
export type CreatureChanges = ItemChanges<CreatureItemData>;
export type CreatureItemConfig = ABFItemConfig<CreatureItemData>;

export type KiSkillItemData = Record<string, never>;
export type KiSkillDataSource = ABFItemBaseDataSource<KiSkillItemData>;
export type KiSkillChanges = ItemChanges<KiSkillItemData>;
export type KiSkillItemConfig = ABFItemConfig<KiSkillItemData>;

export type TechniqueItemData = typeof INITIAL_TECHNIQUE_DATA;
export type TechniqueDataSource = ABFItemBaseDataSource<TechniqueItemData>;
export type TechniqueChanges = ItemChanges<TechniqueItemData>;
export type TechniqueItemConfig = ABFItemConfig<TechniqueItemData>;

export type MartialArtItemData = {
  grade: { value: string };
};
export type MartialArtDataSource = ABFItemBaseDataSource<MartialArtItemData>;
export type MartialArtChanges = ItemChanges<MartialArtItemData>;
export type MartialArtItemConfig = ABFItemConfig<MartialArtItemData>;

export type NemesisSkillItemData = Record<string, never>;
export type NemesisSkillDataSource = ABFItemBaseDataSource<NemesisSkillItemData>;
export type NemesisSkillChanges = ItemChanges<NemesisSkillItemData>;
export type NemesisSkillItemConfig = ABFItemConfig<NemesisSkillItemData>;

export type SpecialSkillItemData = Record<string, never>;
export type SpecialSkillDataSource = ABFItemBaseDataSource<SpecialSkillItemData>;
export type SpecialSkillChanges = ItemChanges<SpecialSkillItemData>;
export type SpecialSkillItemConfig = ABFItemConfig<SpecialSkillItemData>;

export type MetamagicItemData = {
  grade: { value: number };
};
export type MetamagicDataSource = ABFItemBaseDataSource<MetamagicItemData>;
export type MetamagicChanges = ItemChanges<MetamagicItemData>;
export type MetamagicItemConfig = ABFItemConfig<MetamagicItemData>;

export type SelectedSpellItemData = {
  cost: { value: number };
};
export type SelectedSpellDataSource = ABFItemBaseDataSource<SelectedSpellItemData>;
export type SelectedSpellChanges = ItemChanges<SelectedSpellItemData>;
export type SelectedSpellItemConfig = ABFItemConfig<SelectedSpellItemData>;

export type ActViaItemData = typeof INITIAL_ACT_VIA_DATA;
export type ActViaDataSource = ABFItemBaseDataSource<ActViaItemData>;
export type ActViaChanges = ItemChanges<ActViaItemData>;
export type ActViaItemConfig = ABFItemConfig<ActViaItemData>;

export type InnateMagicViaItemData = typeof INITIAL_INNATE_MAGIC_VIA_DATA;
export type InnateMagicViaDataSource = ABFItemBaseDataSource<InnateMagicViaItemData>;
export type InnateMagicViaChanges = ItemChanges<InnateMagicViaItemData>;
export type InnateMagicViaItemConfig = ABFItemConfig<InnateMagicViaItemData>;

export type MaintainedSpellItemData = typeof INITIAL_MAINTAINED_SPELL_DATA;
export type MaintainedSpellDataSource = ABFItemBaseDataSource<MaintainedSpellItemData>;
export type MaintainedSpellChanges = ItemChanges<MaintainedSpellItemData>;
export type MaintainedpellItemConfig = ABFItemConfig<MaintainedSpellItemData>;

export type PreparedSpellItemData = typeof INITIAL_PREPARED_SPELL_DATA;
export type PreparedSpellDataSource = ABFItemBaseDataSource<PreparedSpellItemData>;
export type PreparedSpellChanges = ItemChanges<PreparedSpellItemData>;
export type PreparedSpellItemConfig = ABFItemConfig<PreparedSpellItemData>;

export type SpellItemData = typeof INITIAL_MYSTIC_SPELL_DATA;
export type SpellDataSource = ABFItemBaseDataSource<SpellItemData>;
export type SpellChanges = ItemChanges<SpellItemData>;
export type SpellItemConfig = ABFItemConfig<SpellItemData>;

export type SpellMaintenanceItemData = {
  cost: { value: number };
};
export type SpellMaintenanceDataSource = ABFItemBaseDataSource<SpellMaintenanceItemData>;
export type SpellMaintenanceChanges = ItemChanges<SpellMaintenanceItemData>;
export type SpellMaintenanceItemConfig = ABFItemConfig<SpellMaintenanceItemData>;

export type SummonItemData = Record<string, never>;
export type SummonDataSource = ABFItemBaseDataSource<SummonItemData>;
export type SummonChanges = ItemChanges<SummonItemData>;
export type SummonItemConfig = ABFItemConfig<SummonItemData>;

export type SecondarySpecialSkillItemData = {
  level: { value: number };
};
export type SecondarySpecialSkillDataSource = ABFItemBaseDataSource<SecondarySpecialSkillItemData>;
export type SecondarySpecialSkillChanges = ItemChanges<SecondarySpecialSkillItemData>;
export type SecondarySpecialSkillItemConfig = ABFItemConfig<SecondarySpecialSkillItemData>;

export type InnatePsychicPowerItemData = {
  effect: { value: string };
  value: { value: number };
};
export type InnatePsychicPowerDataSource = ABFItemBaseDataSource<InnatePsychicPowerItemData>;
export type InnatePsychicPowerChanges = ItemChanges<InnatePsychicPowerItemData>;
export type InnatePsychicPowerItemConfig = ABFItemConfig<InnatePsychicPowerItemData>;

export type MentalPatternItemData = typeof INITIAL_MENTAL_PATTERN_DATA;
export type MentalPatternDataSource = ABFItemBaseDataSource<MentalPatternItemData>;
export type MentalPatternChanges = ItemChanges<MentalPatternItemData>;
export type MentalPatternItemConfig = ABFItemConfig<MentalPatternItemData>;

export type PsychicDisciplineItemData = typeof INITIAL_PSYCHIC_DISCIPLINE_DATA;
export type PsychicDisciplineDataSource = ABFItemBaseDataSource<PsychicDisciplineItemData>;
export type PsychicDisciplineChanges = ItemChanges<PsychicDisciplineItemData>;
export type PsychicDisciplineItemConfig = ABFItemConfig<PsychicDisciplineItemData>;

export type PsychicPowerItemData = typeof INITIAL_PSYCHIC_POWER_DATA;
export type PsychicPowerDataSource = ABFItemBaseDataSource<PsychicPowerItemData>;
export type PsychicPowerChanges = ItemChanges<PsychicPowerItemData>;
export type PsychicPowerItemConfig = ABFItemConfig<PsychicPowerItemData>;

export type AdvantageItemData = Record<string, never>;
export type AdvantageDataSource = ABFItemBaseDataSource<AdvantageItemData>;
export type AdvantageChanges = ItemChanges<AdvantageItemData>;
export type AdvantageItemConfig = ABFItemConfig<AdvantageItemData>;

export type DisadvantageItemData = Record<string, never>;
export type DisadvantageDataSource = ABFItemBaseDataSource<DisadvantageItemData>;
export type DisadvantageChanges = ItemChanges<DisadvantageItemData>;
export type DisadvantageItemConfig = ABFItemConfig<DisadvantageItemData>;

export type ElanItemData = {
  level: { value: string };
};
export type ElanDataSource = ABFItemBaseDataSource<ElanItemData>;
export type ElanChanges = ItemChanges<ElanItemData>;
export type ElanItemConfig = ABFItemConfig<ElanItemData>;

export type ElanPowerItemData = {
  level: { value: number };
};
export type ElanPowerDataSource = ABFItemBaseDataSource<ElanPowerItemData>;
export type ElanPowerChanges = ItemChanges<ElanPowerItemData & { elanId: string }>;
export type ElanPowerItemConfig = ABFItemConfig<
  ElanPowerItemData,
  ElanPowerDataSource,
  ElanPowerChanges
>;

export type InventoryItemItemData = {
  amount: { value: number };
  weight: { value: number };
};
export type InventoryItemDataSource = ABFItemBaseDataSource<InventoryItemItemData>;
export type InventoryItemChanges = ItemChanges<InventoryItemItemData>;
export type InventoryItemConfig = ABFItemConfig<InventoryItemData>;

export type LanguageItemData = Record<string, never>;
export type LanguageDataSource = ABFItemBaseDataSource<LanguageItemData>;
export type LanguageChanges = ItemChanges<LanguageItemData>;
export type LanguageItemConfig = ABFItemConfig<LanguageItemData>;

export type LevelItemData = {
  level: { value: number };
};
export type LevelDataSource = ABFItemBaseDataSource<LevelItemData>;
export type LevelChanges = ItemChanges<LevelItemData>;
export type LevelItemConfig = ABFItemConfig<LevelItemData>;

export type NoteItemData = Record<string, never>;
export type NoteDataSource = ABFItemBaseDataSource<NoteItemData>;
export type NoteChanges = ItemChanges<NoteItemData>;
export type NoteItemConfig = ABFItemConfig<NoteItemData>;

export type TitleItemData = Record<string, never>;
export type TitleDataSource = ABFItemBaseDataSource<TitleItemData>;
export type TitleChanges = ItemChanges<TitleItemData>;
export type TitleItemConfig = ABFItemConfig<TitleItemData>;
