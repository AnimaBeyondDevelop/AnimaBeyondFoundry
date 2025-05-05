import { ABFConfig } from '@module/ABFConfig';
import { ResistanceType } from './items/enums/ResistanceTypeEnum';

const {
  HTMLField,
  SchemaField,
  NumberField,
  StringField,
  BooleanField,
  FilePathField,
  ArrayField
} = foundry.data.fields;

export default class AbstractDataModel extends foundry.abstract.TypeDataModel {
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

  static resourceField() {
    return new SchemaField({
      value: new NumberField({ initial: 0 }),
      max: new NumberField({ initial: 0 })
    });
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
      value: new NumberField({ initial: 0 })
    });
  }

  static characteristicField() {
    return new SchemaField({
      value: new NumberField({ initial: 0 }),
      mod: new NumberField({ initial: 0 })
    });
  }

  static secondarieField(attribute) {
    return new SchemaField({
      attribute: this.stringValueField({ initial: attribute }),
      base: this.numberValueField(),
      final: this.numberValueField()
    });
  }

  static kiAccumulationField() {
    return new SchemaField({
      accumulated: this.numberValueField(),
      base: this.numberValueField(),
      final: this.numberValueField()
    });
  }

  static sealField() {
    return new SchemaField({
      isActive: new BooleanField({ initial: false })
    });
  }
}
