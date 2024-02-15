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

      this.updateSource({ 'system.version': INITIAL_ACTOR_DATA.version });
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

    const items = this.getInnerItems(type);
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
    return this.getItemsOf(type).find(item => item._id === itemId);
  }

  public getSecondarySpecialSkills() {
    return this.getItemsOf(ABFItems.SECONDARY_SPECIAL_SKILL);
  }

  public getKnownSpells() {
    return this.getItemsOf(ABFItems.SPELL);
  }

  public getSpellMaintenances() {
    return this.getItemsOf(ABFItems.SPELL_MAINTENANCE);
  }

  public getSelectedSpells() {
    return this.getItemsOf(ABFItems.SELECTED_SPELL);
  }

  public getKnownMetamagics() {
    return this.getItemsOf(ABFItems.METAMAGIC);
  }

  public getKnownSummonings() {
    return this.getItemsOf(ABFItems.SUMMON);
  }

  public getCategories() {
    return this.getItemsOf(ABFItems.LEVEL);
  }

  public getKnownLanguages() {
    return this.getItemsOf(ABFItems.LANGUAGE);
  }

  public getElans() {
    return this.getItemsOf(ABFItems.ELAN);
  }

  public getElanPowers() {
    return this.getItemsOf(ABFItems.ELAN_POWER);
  }

  public getTitles() {
    return this.getItemsOf(ABFItems.TITLE);
  }

  public getAdvantages() {
    return this.getItemsOf(ABFItems.ADVANTAGE);
  }

  public getDisadvantages() {
    return this.getItemsOf(ABFItems.DISADVANTAGE);
  }

  public getContacts() {
    return this.getItemsOf(ABFItems.CONTACT);
  }

  public getNotes() {
    return this.getItemsOf(ABFItems.NOTE);
  }

  public getPsychicDisciplines() {
    return this.getItemsOf(ABFItems.PSYCHIC_DISCIPLINE);
  }

  public getMentalPatterns() {
    return this.getItemsOf(ABFItems.MENTAL_PATTERN);
  }

  public getInnatePsychicPowers() {
    return this.getItemsOf(ABFItems.INNATE_PSYCHIC_POWER);
  }

  public getPsychicPowers() {
    return this.getItemsOf(ABFItems.PSYCHIC_POWER);
  }

  public getKiSkills() {
    return this.getItemsOf(ABFItems.KI_SKILL);
  }

  public getNemesisSkills() {
    return this.getItemsOf(ABFItems.NEMESIS_SKILL);
  }

  public getArsMagnus() {
    return this.getItemsOf(ABFItems.ARS_MAGNUS);
  }

  public getMartialArts() {
    return this.getItemsOf(ABFItems.MARTIAL_ART);
  }

  public getKnownCreatures() {
    return this.getItemsOf(ABFItems.CREATURE);
  }

  public getSpecialSkills() {
    return this.getItemsOf(ABFItems.SPECIAL_SKILL);
  }

  public getKnownTechniques() {
    return this.getItemsOf(ABFItems.TECHNIQUE);
  }

  public getCombatSpecialSkills() {
    return this.getItemsOf(ABFItems.COMBAT_SPECIAL_SKILL);
  }

  public getCombatTables() {
    return this.getItemsOf(ABFItems.COMBAT_TABLE);
  }

  public getAmmos() {
    return this.getItemsOf(ABFItems.AMMO);
  }

  public getWeapons() {
    return this.getItemsOf(ABFItems.WEAPON);
  }

  public getArmors() {
    return this.getItemsOf(ABFItems.ARMOR);
  }

  public getInventoryItems() {
    return this.getItemsOf(ABFItems.INVENTORY_ITEM);
  }

  public getAllItems() {
    return Object.values(ABFItems).flatMap(itemType => this.getItemsOf(itemType));
  }

  protected _getSheetClass(): ConstructorOf<FormApplication> | null {
    return ABFActorSheet as unknown as ConstructorOf<FormApplication>;
  }

  private getItemsOf(type) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    if (!configuration) {
      console.error(`No configuration found for item type ${type}`);

      return [];
    }

    if (configuration.isInternal) {
      return this.getInnerItems(type);
    }

    return this.items.filter(i => i.type === type);
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
