import AbstractDataModel from '../AbstractDataModel.js';
import { ABFConfig } from '@module/ABFConfig';
import { CombatType, ActionType } from './enums/CombatEnums.js';
import { NoneCriticType } from './enums/CriticEnums.js';
import { SpellType, Via } from './enums/SpellEnums.js';
import { migrateCriticValues } from './migrations/migrateCriticValues.js';
import { migrateSpellGrades } from './migrations/migrateSpellGrades.js';
import { mutateEnrichedDescription } from './mutations/mutateEnrichedDescription.js';

const {
  HTMLField,
  SchemaField,
  NumberField,
  StringField,
  FilePathField,
  ArrayField,
  BooleanField,
  AnyField
} = foundry.data.fields;

export class SpellData extends AbstractDataModel {
  static version = 3;

  static mutations = [mutateEnrichedDescription];

  static migrations = { 2: migrateCriticValues, 3: migrateSpellGrades };

  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      level: this.numberValueField(),
      via: this.stringValueField({
        initial: Via.AIR,
        choices: ABFConfig.iterables.mystic.vias
      }),
      spellType: this.stringValueField({
        initial: SpellType.ATTACK,
        choices: ABFConfig.iterables.mystic.spellTypes
      }),
      actionType: this.stringValueField({
        initial: ActionType.ACTIVE,
        choices: ABFConfig.iterables.combat.actionTypes
      }),
      combatType: this.stringValueField({
        initial: CombatType.NONE,
        choices: ABFConfig.iterables.combat.combatTypes
      }),
      hasDailyMaintenance: this.booleanValueField(),
      description: this.stringValueField(),
      enrichedDescription: new HTMLField(),
      critic: this.stringValueField({
        initial: NoneCriticType.NONE,
        choices: ABFConfig.iterables.combat.criticTypesWithNone
      }),
      visible: new BooleanField({ initial: false }),
      macro: new StringField({ initial: '' }),
      grades: new SchemaField({
        base: this.gradeValueField(),
        intermediate: this.gradeValueField(),
        advanced: this.gradeValueField(),
        arcane: this.gradeValueField()
      })
    };
  }

  static gradeValueField() {
    return new SchemaField({
      // TODO: migrate nested values to parent attribute
      intRequired: this.numberValueField(),
      zeon: this.numberValueField(),
      // TODO: Make maintenanceCost a strict Number Field
      maintenanceCost: new SchemaField({ value: new AnyField({ initial: 0 }) }),
      description: this.stringValueField(),
      //
      damage: new NumberField({ initial: 0, min: 0 }),
      shieldPoints: new NumberField({ initial: 0, min: 0 }),
      damageBarrier: new NumberField({ initial: 0, min: 0 }),
      resistances: new SchemaField({
        primary: this.resistanceField(),
        secondary: this.resistanceField()
      })
    });
  }
}
