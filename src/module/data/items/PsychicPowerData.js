import ItemDataModel from './itemDataModel.js';
import { ABFConfig } from '@module/ABFConfig';
import { CombatType, ActionType } from './enums/CombatEnums.js';
import { PsychicDiscipline } from './enums/PsychicPowerEnums.js';
import { NoneCriticType } from './enums/CriticEnums.js';
import { migrateCriticValues } from './migrations/migrateCriticValues.js';
import { migratePsychicEffects } from './migrations/migratePsychicEffects.js';
import { mutateEnrichedDescription } from './mutations/mutateEnrichedDescription.js';

const {
  HTMLField,
  SchemaField,
  NumberField,
  StringField,
  FilePathField,
  ArrayField,
  BooleanField
} = foundry.data.fields;

export class PsychicPowerData extends ItemDataModel {
  static version = 3;

  static mutations = [mutateEnrichedDescription];

  static migrations = { 2: migrateCriticValues, 3: migratePsychicEffects };

  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      description: this.stringValueField(),
      enrichedDescription: new HTMLField(),
      level: this.numberValueField(),
      effects: new SchemaField({
        20: this.effectValueField(),
        40: this.effectValueField(),
        80: this.effectValueField(),
        120: this.effectValueField(),
        140: this.effectValueField(),
        180: this.effectValueField(),
        240: this.effectValueField(),
        280: this.effectValueField(),
        320: this.effectValueField(),
        440: this.effectValueField()
      }),
      actionType: this.stringValueField({
        initial: ActionType.ACTIVE,
        choices: ABFConfig.iterables.combat.actionTypes
      }),
      combatType: this.stringValueField({
        initial: CombatType.NONE,
        choices: ABFConfig.iterables.combat.combatTypes
      }),
      discipline: this.stringValueField({
        initial: PsychicDiscipline.MATRIX_POWERS,
        choices: ABFConfig.iterables.psychic.disciplines
      }),
      critic: this.stringValueField({
        initial: NoneCriticType.NONE,
        choices: ABFConfig.iterables.combat.criticTypesWithNone
      }),
      macro: new StringField({ initial: '' }),
      hasMaintenance: this.booleanValueField(),
      visible: new BooleanField({ initial: false }),
      bonus: this.numberValueField()
    };
  }

  static effectValueField() {
    return new SchemaField({
      //TODO: remove "value" once it have been replace for "description" in hbs and config files.
      value: new StringField({ initial: '' }),
      description: new StringField({ initial: '' }),
      damage: new NumberField({ initial: 0, min: 0 }),
      fatigue: new NumberField({ initial: undefined }),
      shieldPoints: new NumberField({ initial: 0, min: 0 }),
      damageBarrier: new NumberField({ initial: 0, min: 0 }),
      resistances: new SchemaField({
        primary: this.resistanceField(),
        secondary: this.resistanceField()
      })
    });
  }
}
