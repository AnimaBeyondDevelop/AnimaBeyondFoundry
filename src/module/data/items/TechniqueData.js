import ItemDataModel from './itemDataModel.js';

const { HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField } =
  foundry.data.fields;

export class TechniqueData extends ItemDataModel {
  static mutations = [mutateEnrichedDescription];

  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      description: this.stringValueField(),
      enrichedDescription: new HTMLField(),
      level: this.numberValueField(),
      strength: this.numberValueField(),
      agility: this.numberValueField(),
      dexterity: this.numberValueField(),
      constitution: this.numberValueField(),
      willPower: this.numberValueField(),
      power: this.numberValueField(),
      martialKnowledge: this.numberValueField()
    };
  }
}
