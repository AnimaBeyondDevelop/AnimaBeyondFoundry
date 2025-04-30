import AbstractDataModel from '../AbstractDataModel.js';
import { NoneCriticType } from './enums/CriticEnums.js';
import { ABFConfig } from '@module/ABFConfig.js';

const { HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField } =
  foundry.data.fields;

export class AmmoData extends AbstractDataModel {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      amount: this.numberValueField(),
      damage: this.basicAbilityField(),
      critic: this.stringValueField({
        initial: NoneCriticType.NONE,
        choices: ABFConfig.iterables.combat.criticTypesWithNone
      }),
      quality: this.numberValueField(),
      integrity: this.basicAbilityField(),
      breaking: this.basicAbilityField(),
      presence: this.basicAbilityField(),
      special: this.stringValueField()
    };
  }
}
