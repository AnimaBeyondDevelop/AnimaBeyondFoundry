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

export class ABFActor extends Actor {
  i18n: Localization;

  constructor(
    data: ConstructorParameters<typeof foundry.documents.BaseActor>[0],
    context: ConstructorParameters<typeof foundry.documents.BaseActor>[1]
  ) {
    super(data, context);

    this.i18n = (game as Game).i18n;

    if (this.data.data.version !== INITIAL_ACTOR_DATA.version) {
      Log.log(
        `Upgrading actor ${this.data.name} (${this.data._id}) from version ${this.data.data.version} to ${INITIAL_ACTOR_DATA.version}`
      );

      this.data.update({ data: { version: INITIAL_ACTOR_DATA.version } });
    }
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    this.data.data = foundry.utils.mergeObject(this.data.data, INITIAL_ACTOR_DATA, { overwrite: false });

    prepareActor(this);
  }

  applyFatigue(fatigueUsed: number) {
    const newFatigue = this.data.data.characteristics.secondaries.fatigue.value - fatigueUsed;

    this.update({
      data: {
        characteristics: {
          secondaries: { fatigue: { value: newFatigue } }
        }
      }
    });
  }

  applyDamage(damage: number) {
    const newLifePoints = this.data.data.characteristics.secondaries.lifePoints.value - damage;

    this.update({
      data: {
        characteristics: {
          secondaries: { lifePoints: { value: newLifePoints } }
        }
      }
    });
  }

  public async createItem({ type, name, data = {} }: { type: ABFItems; name: string; data?: unknown }) {
    await this.createEmbeddedDocuments('Item', [{ type, name, data }]);
  }

  public async createInnerItem({ type, name, data = {} }: { type: ABFItems; name: string; data?: unknown }) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    const items = getFieldValueFromPath<any[]>(this.data.data, configuration.fieldPath) ?? [];

    await this.update({
      data: getUpdateObjectFromPath([...items, { _id: nanoid(), type, name, data }], configuration.fieldPath)
    });
  }

  public async updateItem({ id, name, data = {} }: { id: string; name?: string; data?: unknown }) {
    const item = this.getItem(id);

    if (item) {
      let updateObject: Record<string, unknown> = { data };

      if (name) {
        updateObject = { ...updateObject, name };
      }

      if ((!!name && name !== item.name) || JSON.stringify(data) !== JSON.stringify(item.data.data)) {
        await item.update(updateObject);
      }
    }
  }

  protected _getSheetClass(): ConstructorOf<FormApplication> | null {
    return ABFActorSheet as unknown as ConstructorOf<FormApplication>;
  }

  public async updateInnerItem(
    {
      type,
      id,
      name,
      data = {}
    }: {
      type: ABFItems;
      id: string;
      name?: string;
      data?: unknown;
    },
    forceSave = false
  ) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    const items = getFieldValueFromPath<any[]>(this.data.data, configuration.fieldPath);

    const item = items.find(it => it._id === id);

    if (item) {
      const hasChanges =
        forceSave || (!!name && name !== item.name) || JSON.stringify(data) !== JSON.stringify(item.data);

      if (hasChanges) {
        if (name) {
          item.name = name;
        }

        if (data) {
          item.data = data;
        }

        await this.update({
          data: getUpdateObjectFromPath(items, configuration.fieldPath)
        });
      }
    }
  }

  private getItem(itemId: string) {
    return this.getEmbeddedDocument('Item', itemId);
  }

  getInnerItem(type: ABFItems, itemId: string) {
    const configuration = ALL_ITEM_CONFIGURATIONS[type];

    return getFieldValueFromPath<any>(this.data.data, configuration.fieldPath).find(item => item._id === itemId);
  }
}
