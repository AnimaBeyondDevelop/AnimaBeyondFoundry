import { INITIAL_ACTOR_DATA } from '@module/actor/constants';
import { ResistanceType } from './enums/ResistanceTypeEnum.js';
import { ABFConfig } from '@module/ABFConfig';

const {
  HTMLField,
  SchemaField,
  NumberField,
  StringField,
  BooleanField,
  FilePathField,
  ArrayField
} = foundry.data.fields;

export default class ItemDataModel extends foundry.abstract.TypeDataModel {
  static version = 1;
  static mutations = [];
  static migrations = {};

  static defineSchema() {
    return {};
  }

  static async migrateData(data) {
    if (Object.keys(this.migrations).length > 0) {
      //TODO: Make a tracking version system
      let currentVersion = 1;
      for (let version = currentVersion + 1; version <= this.version; version++) {
        const migrationFunction = this.migrations[version];
        if (migrationFunction) {
          data = await migrationFunction(data);
        }
      }
    }
    return super.migrateData(data);
  }

  async prepareDerivedData() {
    super.prepareDerivedData();
    if (this.constructor.mutations.length === 0) return;

    for (const fn of this.constructor.mutations) {
      await fn(this);
    }
  }

  static numberValueField(options = { initial: 0 }) {
    return new SchemaField({ value: new NumberField({ ...options }) });
  }

  static stringValueField(options = { initial: '' }) {
    return new SchemaField({ value: new StringField({ ...options }) });
  }

  static booleanValueField(options = { initial: false }) {
    return new SchemaField({ value: new BooleanField({ ...options }) });
  }

  static htmlValueField(options) {
    return new SchemaField({ value: new HTMLField({ ...options }) });
  }

  static basicAbilityField() {
    return new SchemaField({
      base: this.numberValueField(),
      final: this.numberValueField()
    });
  }

  static specialAbilityField() {
    return new SchemaField({
      base: this.numberValueField(),
      special: this.numberValueField(),
      final: this.numberValueField()
    });
  }

  static resistanceField() {
    return new SchemaField({
      type: new StringField({
        initial: ResistanceType.NONE,
        choices: ABFConfig.iterables.combat.resistances
      }),
      value: new NumberField({ initial: 0, min: 0 })
    });
  }
}
