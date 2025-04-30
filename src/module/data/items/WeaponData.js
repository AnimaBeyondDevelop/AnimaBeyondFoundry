import ItemDataModel from './itemDataModel.js';
import { CriticType, NoneCriticType } from './enums/CriticEnums.js';
import {
  WeaponEquippedHandType,
  WeaponKnowledgeType,
  WeaponManageabilityType,
  WeaponShotType,
  WeaponSize,
  WeaponSizeProportion
} from './enums/WeaponEnums.js';
import { ABFConfig } from '@module/ABFConfig';
import { mutateStrRequired } from './mutations/mutateStrRequired';
import { mutateWeaponStrength } from './mutations/mutateWeaponStrength';
import { migrateCriticValues } from './migrations/migrateCriticValues.js';

const {
  HTMLField,
  SchemaField,
  NumberField,
  StringField,
  FilePathField,
  ArrayField,
  DocumentIdField
} = foundry.data.fields;

export class WeaponData extends ItemDataModel {
  static version = 2;

  static mutations = [mutateStrRequired, mutateWeaponStrength];

  static migrations = {
    2: migrateCriticValues
  };

  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      equipped: this.booleanValueField(),
      isShield: this.booleanValueField(),
      special: this.stringValueField(),
      integrity: this.specialAbilityField(),
      breaking: this.specialAbilityField(),
      attack: this.specialAbilityField(),
      block: this.specialAbilityField(),
      damage: this.specialAbilityField(),
      initiative: this.specialAbilityField(),
      presence: this.specialAbilityField(),
      size: this.stringValueField({
        initial: WeaponSize.MEDIUM,
        choices: ABFConfig.iterables.combat.weapon.sizes
      }),
      sizeProportion: this.stringValueField({
        initial: WeaponSizeProportion.NORMAL,
        choices: ABFConfig.iterables.combat.weapon.sizeProportions
      }),
      strRequired: new SchemaField({
        oneHand: this.basicAbilityField(),
        twoHands: this.basicAbilityField()
      }),
      quality: this.numberValueField(),
      oneOrTwoHanded: this.stringValueField({
        initial: WeaponEquippedHandType.ONE_HANDED,
        choices: ABFConfig.iterables.combat.weapon.equippedHandTypes
      }),
      knowledgeType: this.stringValueField({
        initial: WeaponKnowledgeType.KNOWN,
        choices: ABFConfig.iterables.combat.weapon.knowledgeTypes
      }),
      manageabilityType: this.stringValueField({
        initial: WeaponManageabilityType.ONE_HAND,
        choices: ABFConfig.iterables.combat.weapon.manageabilityTypes
      }),
      shotType: this.stringValueField({
        initial: WeaponShotType.SHOT,
        choices: ABFConfig.iterables.combat.weapon.shotTypes
      }),
      isRanged: this.booleanValueField(),
      range: this.basicAbilityField(),
      cadence: this.stringValueField(),
      reload: this.basicAbilityField(),
      hasOwnStr: this.booleanValueField(),
      weaponStrength: this.basicAbilityField(),
      critic: new SchemaField({
        primary: this.stringValueField({
          initial: CriticType.CUT,
          choices: ABFConfig.iterables.combat.criticTypesWithNone
        }),
        secondary: this.stringValueField({
          initial: NoneCriticType.NONE,
          choices: ABFConfig.iterables.combat.criticTypesWithNone
        })
      }),
      ammoId: new DocumentIdField({ blank: true })
    };
  }
}
