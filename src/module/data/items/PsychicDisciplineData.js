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

export class PsychicDisciplineData extends AbstractDataModel {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      imbalance: new BooleanField({ initial: false })
    };
  }
}
