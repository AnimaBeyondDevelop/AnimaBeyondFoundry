import AbstractDataModel from '../AbstractDataModel.js';

const {
  HTMLField,
  SchemaField,
  NumberField,
  StringField,
  BooleanField,
  FilePathField,
  ArrayField
} = foundry.data.fields;

class ActorDataModel extends AbstractDataModel {
  static defineSchema() {
    return {};
  }
  static async migrateData(source) {
    const update = super.migrateData(source);

    const embeddedUpdates = foundry.abstract.Document.migrateEmbeddedDocuments(
      source,
      this.parent
    );
    if (embeddedUpdates) Object.assign(update, embeddedUpdates);

    return update;
  }
}
