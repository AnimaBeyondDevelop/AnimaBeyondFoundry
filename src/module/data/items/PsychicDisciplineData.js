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

export class PsychicDisciplineData extends ItemDataModel {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      imbalance: new BooleanField({ initial: false })
    };
  }
}
