import ItemDataModel from './itemDataModel.js';
import { SpellGrade } from './enums/SpellEnums.js';
import { ABFConfig } from '@module/ABFConfig.js';
import { choices } from 'yargs';

const { HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField } =
  foundry.data.fields;

export class SupernaturalShieldData extends ItemDataModel {
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
