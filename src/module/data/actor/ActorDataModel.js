const {
  HTMLField,
  SchemaField,
  NumberField,
  StringField,
  BooleanField,
  FilePathField,
  ArrayField
} = foundry.data.fields;

class ActorDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      //TODO: Define schema for Actor, this is a placeholder
      resources: new fields.SchemaField({
        health: new SchemaField(resourceField(10, 10)),
        power: new SchemaField(resourceField(1, 3))
      })
    };
  }
  migrateData(source) {
    const update = super.migrateData(source);

    const embeddedUpdates = foundry.abstract.Document.migrateEmbeddedDocuments(
      source,
      this.parent
    );
    if (embeddedUpdates) Object.assign(update, embeddedUpdates);

    return update;
  }
}
