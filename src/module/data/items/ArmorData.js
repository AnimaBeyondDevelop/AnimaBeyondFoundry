import ItemDataModel from './itemDataModel.js';
import { ABFConfig } from '@module/ABFConfig.js';
import { ArmorLocation, ArmorType } from './enums/ArmorEnums.js';

const { HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField } =
  foundry.data.fields;

export class ArmorData extends ItemDataModel {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      cut: this.basicAbilityField(),
      impact: this.basicAbilityField(),
      thrust: this.basicAbilityField(),
      heat: this.basicAbilityField(),
      electricity: this.basicAbilityField(),
      cold: this.basicAbilityField(),
      energy: this.basicAbilityField(),
      integrity: this.basicAbilityField(),
      presence: this.basicAbilityField(),
      wearArmorRequirement: this.basicAbilityField(),
      movementRestriction: this.basicAbilityField(),
      naturalPenalty: this.basicAbilityField(),
      perceptionPenalty: this.basicAbilityField(),
      isEnchanted: this.booleanValueField(),
      type: this.stringValueField({
        initial: ArmorType.SOFT,
        choices: ABFConfig.iterables.combat.armor.armorTypes
      }),
      localization: this.stringValueField({
        initial: ArmorLocation.BREASTPLATE,
        choices: ABFConfig.iterables.combat.armor.armorLocations
      }),
      quality: this.numberValueField(),
      equipped: this.booleanValueField()
    };
  }
}
