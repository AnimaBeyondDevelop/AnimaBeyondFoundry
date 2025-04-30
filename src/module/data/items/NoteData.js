import ItemDataModel from './itemDataModel.js';

const { HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField } =
  foundry.data.fields;

export class NoteData extends ItemDataModel {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      enrichedName: new HTMLField()
    };
  }
}
