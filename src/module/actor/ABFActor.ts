/* eslint-disable class-methods-use-this */
import { nanoid } from '../../vendor/nanoid/nanoid';
import { ABFItems } from '../items/ABFItems';
import { ALL_ITEM_CONFIGURATIONS } from './utils/prepareItems/constants';
import { getUpdateObjectFromPath } from './utils/prepareItems/util/getUpdateObjectFromPath';
import { getFieldValueFromPath } from './utils/prepareItems/util/getFieldValueFromPath';
import { prepareActor } from './utils/prepareActor/prepareActor';
import { INITIAL_ACTOR_DATA } from './constants';
import ABFActorSheet from './ABFActorSheet';
import { Log } from '../../utils/Log';
import { migrateItem } from '../items/migrations/migrateItem';

export class ABFActor extends Actor {
  i18n: Localization;

  constructor(
    data: ConstructorParameters<typeof foundry.documents.BaseActor>[0],
    context: ConstructorParameters<typeof foundry.documents.BaseActor>[1]
  ) {
    super(data, context);

    this.i18n = (game as Game).i18n;

    if (this.system.version !== INITIAL_ACTOR_DATA.version) {
      Log.log(
        `Upgrading actor ${this.name} (${this._id}) from version ${this.system.version} to ${INITIAL_ACTOR_DATA.version}`
      );

      this.updateSource({ version: INITIAL_ACTOR_DATA.version });
    }
  }

  async prepareDerivedData() {
    super.prepareDerivedData();

    this.system = foundry.utils.mergeObject(this.system, INITIAL_ACTOR_DATA, {
      overwrite: false
    });

    await prepareActor(this);
  }

  applyFatigue(fatigueUsed: number) {
    const newFatigue =
      this.system.characteristics.secondaries.fatigue.value - fatigueUsed;

    this.update({
      system: {
        characteristics: {
          secondaries: { fatigue: { value: newFatigue } }
        }
      }
    });
  }

  applyDamage(damage: number) {
    const newLifePoints =
      this.system.characteristics.secondaries.lifePoints.value - damage;

    this.update({
      system: {
        characteristics: {
          secondaries: { lifePoints: { value: newLifePoints } }
        }
      }
    });
  }

  public async createItem({
    type,
    name,
    system = {}
  }: {
    type: ABFItems;
    name: string;
    system?: unknown;
  }) {
    await this.createEmbeddedDocuments('Item', [
      {
        type,
        name,
        system
      }
    ]);
  }

  public async createInnerItem({
    type,
    name,
    system = {}
  }: {
    type: ABFItems;
    name: string;
    system?: unknown;
  }) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    const items =
      getFieldValueFromPath<any[]>(this.system, configuration.fieldPath) ?? [];

    await this.update({
      system: getUpdateObjectFromPath(
        [
          ...items,
          {
            _id: nanoid(),
            type,
            name,
            system
          }
        ],
        configuration.fieldPath
      )
    });
  }

  public async updateItem({
    id,
    name,
    system = {}
  }: {
    id: string;
    name?: string;
    system?: unknown;
  }) {
    const item = this.getItem(id);

    if (item) {
      let updateObject: Record<string, unknown> = { system };

      if (name) {
        updateObject = {
          ...updateObject,
          name
        };
      }

      if (
        (!!name && name !== item.name) ||
        JSON.stringify(system) !== JSON.stringify(item.system)
      ) {
        await item.update(updateObject);
      }
    }
  }

  public async updateInnerItem(
    {
      type,
      id,
      name,
      system = {}
    }: {
      type: ABFItems;
      id: string;
      name?: string;
      system?: unknown;
    },
    forceSave = false
  ) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    const items = getFieldValueFromPath<any[]>(this.system, configuration.fieldPath);

    const item = items.find(it => it._id === id);

    if (item) {
      const hasChanges =
        forceSave ||
        (!!name && name !== item.name) ||
        JSON.stringify(system) !== JSON.stringify(item.system);

      if (hasChanges) {
        if (name) {
          item.name = name;
        }

        if (system) {
          item.system = system;
        }

        await this.update({
          system: getUpdateObjectFromPath(items, configuration.fieldPath)
        });
      }
    }
  }

  getInnerItem(type: ABFItems, itemId: string) {
    return this.getInnerItems(type).find(item => item._id === itemId);
  }

  public getSecondarySpecialSkills() {
    return this.getInnerItems(ABFItems.SECONDARY_SPECIAL_SKILL);
  }

  public getKnownSpells() {
    return this.getInnerItems(ABFItems.SPELL);
  }

  public getSpellMaintenances() {
    return this.getInnerItems(ABFItems.SPELL_MAINTENANCE);
  }

  public getSelectedSpells() {
    return this.getInnerItems(ABFItems.SELECTED_SPELL);
  }

  public getKnownMetamagics() {
    return this.getInnerItems(ABFItems.METAMAGIC);
  }

  public getKnownSummonings() {
    return this.getInnerItems(ABFItems.SUMMON);
  }

  public getCategories() {
    return this.getInnerItems(ABFItems.LEVEL);
  }

  public getKnownLanguages() {
    return this.getInnerItems(ABFItems.LANGUAGE);
  }

  public getElans() {
    return this.getInnerItems(ABFItems.ELAN);
  }

  public getElanPowers() {
    return this.getInnerItems(ABFItems.ELAN_POWER);
  }

  public getTitles() {
    return this.getInnerItems(ABFItems.TITLE);
  }

  public getAdvantages() {
    return this.getInnerItems(ABFItems.ADVANTAGE);
  }

  public getDisadvantages() {
    return this.getInnerItems(ABFItems.DISADVANTAGE);
  }

  public getContacts() {
    return this.getInnerItems(ABFItems.CONTACT);
  }

  public getNotes() {
    return this.getInnerItems(ABFItems.NOTE);
  }

  public getPsychicDisciplines() {
    return this.getInnerItems(ABFItems.PSYCHIC_DISCIPLINE);
  }

  public getMentalPatterns() {
    return this.getInnerItems(ABFItems.MENTAL_PATTERN);
  }

  public getInnatePsychicPowers() {
    return this.getInnerItems(ABFItems.INNATE_PSYCHIC_POWER);
  }

  public getPsychicPowers() {
    return this.getInnerItems(ABFItems.PSYCHIC_POWER);
  }

  public getKiSkills() {
    return this.getInnerItems(ABFItems.KI_SKILL);
  }

  public getNemesisSkills() {
    return this.getInnerItems(ABFItems.NEMESIS_SKILL);
  }

  public getArsMagnus() {
    return this.getInnerItems(ABFItems.ARS_MAGNUS);
  }

  public getMartialArts() {
    return this.getInnerItems(ABFItems.MARTIAL_ART);
  }

  public getKnownCreatures() {
    return this.getInnerItems(ABFItems.CREATURE);
  }

  public getSpecialSkills() {
    return this.getInnerItems(ABFItems.SPECIAL_SKILL);
  }

  public getKnownTechniques() {
    return this.getInnerItems(ABFItems.TECHNIQUE);
  }

  public getCombatSpecialSkills() {
    return this.getInnerItems(ABFItems.COMBAT_SPECIAL_SKILL);
  }

  public getCombatTables() {
    return this.getInnerItems(ABFItems.COMBAT_TABLE);
  }

  public getAmmos() {
    return this.getInnerItems(ABFItems.AMMO);
  }

  public getWeapons() {
    return this.getInnerItems(ABFItems.WEAPON);
  }

  public getArmors() {
    return this.getInnerItems(ABFItems.ARMOR);
  }

  public getInventoryItems() {
    return this.getInnerItems(ABFItems.INVENTORY_ITEM);
  }

  public getAllItems() {
    const externalItems = [...this.items.values()].map(migrateItem);

    return [
      ...externalItems,
      ...Object.values(ABFItems).flatMap(itemType => this.getInnerItems(itemType))
    ];
  }

  protected _getSheetClass(): ConstructorOf<FormApplication> | null {
    return ABFActorSheet as unknown as ConstructorOf<FormApplication>;
  }

  private getInnerItems(type) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    if (!configuration) {
      console.error(`No configuration found for item type ${type}`);

      return [];
    }

    if (configuration.fieldPath.length === 0) {
      return [];
    }

    const items = getFieldValueFromPath<any>(this.system, configuration.fieldPath);

    if (Array.isArray(items)) {
      return items.map(migrateItem);
    }

    return [];
  }

  private getItem(itemId: string) {
    return this.getEmbeddedDocument('Item', itemId);
  }
}
