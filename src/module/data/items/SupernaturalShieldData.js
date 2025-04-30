import AbstractDataModel from '../AbstractDataModel.js';
import { SpellGrade } from './enums/SpellEnums.js';
import { ABFConfig } from '@module/ABFConfig.js';

const { HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField } =
  foundry.data.fields;

export class SupernaturalShieldData extends AbstractDataModel {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      type: new StringField({ initial: 'none', choices: ['none', 'mystic', 'psychic'] }),
      spellGrade: new StringField({
        initial: SpellGrade.BASE,
        choices: ABFConfig.iterables.mystic.spellGrades
      }),
      damageBarrier: new NumberField({ initial: 0 }),
      shieldPoints: new NumberField({ initial: 0 }),
      origin: new StringField({ initial: '' })
    };
  }
}
