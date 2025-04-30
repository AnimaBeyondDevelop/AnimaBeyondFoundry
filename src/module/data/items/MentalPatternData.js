import AbstractDataModel from '../AbstractDataModel.js';

const {
  HTMLField,
  SchemaField,
  NumberField,
  StringField,
  FilePathField,
  ArrayField,
  BooleanField
} = foundry.data.fields;

export class MentalPatternData extends AbstractDataModel {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      bonus: this.stringValueField(),
      penalty: this.stringValueField()
    };
  }
}
