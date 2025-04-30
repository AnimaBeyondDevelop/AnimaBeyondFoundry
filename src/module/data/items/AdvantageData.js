import AbstractDataModel from '../AbstractDataModel.js';

const { HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField } =
  foundry.data.fields;

export class AdvantageData extends AbstractDataModel {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData
    };
  }
}
