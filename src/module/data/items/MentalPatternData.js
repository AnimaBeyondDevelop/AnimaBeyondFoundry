import ItemDataModel from './itemDataModel.js';

const {
  HTMLField,
  SchemaField,
  NumberField,
  StringField,
  FilePathField,
  ArrayField,
  BooleanField
} = foundry.data.fields;

export class MentalPatternData extends ItemDataModel {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      bonus: this.stringValueField(),
      penalty: this.stringValueField()
    };
  }
}
