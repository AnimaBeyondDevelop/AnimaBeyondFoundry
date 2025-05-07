import { mutatePrimaryModifiers } from '@module/actor/utils/prepareActor/calculations/actor/mutatePrimaryModifiers.js';
import AbstractDataModel from '../AbstractDataModel.js';
import { mutateRegenerationType } from '@module/actor/utils/prepareActor/calculations/actor/general/mutateRegenerationType.js';
import { mutateAllActionsModifier } from '@module/actor/utils/prepareActor/calculations/actor/modifiers/mutateAllActionsModifier.js';
import { mutateArmorsData } from '@module/actor/utils/prepareActor/calculations/items/armor/mutateArmorsData.js';
import { mutateTotalArmor } from '@module/actor/utils/prepareActor/calculations/actor/mutateTotalArmor.js';
import { mutateNaturalPenalty } from '@module/actor/utils/prepareActor/calculations/actor/modifiers/mutateNaturalPenalty.js';
import { mutatePhysicalModifier } from '@module/actor/utils/prepareActor/calculations/actor/modifiers/mutatePhysicalModifier.js';
import { mutatePerceptionPenalty } from '@module/actor/utils/prepareActor/calculations/actor/modifiers/mutatePerceptionPenalty.js';
import { mutateCombatData } from '@module/actor/utils/prepareActor/calculations/actor/combat/mutateCombatData.js';
import { mutateMovementType } from '@module/actor/utils/prepareActor/calculations/actor/general/mutateMovementType.js';
import { mutateSecondariesData } from '@module/actor/utils/prepareActor/calculations/actor/secondaries/mutateSecondariesData.js';
import { mutateAmmoData } from '@module/actor/utils/prepareActor/calculations/items/ammo/mutateAmmoData.js';
import { mutateWeaponsData } from '@module/actor/utils/prepareActor/calculations/items/weapon/mutateWeaponsData.js';
import { mutateInitiative } from '@module/actor/utils/prepareActor/calculations/actor/mutateInitiative.js';
import { mutateMysticData } from '@module/actor/utils/prepareActor/calculations/actor/mystic/mutateMysticData.js';
import { mutatePsychicData } from '@module/actor/utils/prepareActor/calculations/actor/psychic/mutatePsychicData.js';
import { mutateDomineData } from '@module/actor/utils/prepareActor/calculations/actor/domine/mutateDomineData.js';

const {
  HTMLField,
  SchemaField,
  NumberField,
  StringField,
  BooleanField,
  FilePathField,
  ArrayField,
  AnyField
} = foundry.data.fields;

export class ActorDataModel extends AbstractDataModel {
  static mutations = [
    mutatePrimaryModifiers,
    mutateRegenerationType,
    mutateAllActionsModifier,
    mutateArmorsData,
    mutateTotalArmor,
    mutateNaturalPenalty,
    mutatePhysicalModifier,
    mutatePerceptionPenalty,
    mutateCombatData,
    mutateMovementType,
    mutateSecondariesData,
    // mutateAmmoData,
    // mutateWeaponsData,
    mutateInitiative,
    mutateMysticData,
    mutatePsychicData,
    mutateDomineData
  ];
  static defineSchema() {
    return {
      version: new NumberField({ initial: 0 }),
      ui: new SchemaField({
        contractibleItems: new AnyField(),
        tabVisibility: new SchemaField({
          mystic: this.booleanValueField(),
          domine: this.booleanValueField(),
          psychic: this.booleanValueField()
        })
      }),
      automationOptions: new SchemaField({
        calculateFatigueModifier: this.booleanValueField()
      }),
      general: this.generalData(),
      characteristics: this.characteristicsData(),
      secondaries: this.secondariesData(),
      combat: this.combatData(),
      mystic: this.mysticData(),
      domine: this.domineData(),
      psychic: this.psychicData()
    };
  }
  // static async migrateData(source) {}

  static generalData() {
    return new SchemaField({
      settings: new SchemaField({
        openRolls: this.numberValueField({ initial: 90 }),
        fumbles: this.numberValueField({ initial: 3 }),
        openOnDoubles: this.booleanValueField(),
        perceiveMystic: this.booleanValueField(),
        perceivePsychic: this.booleanValueField(),
        inmaterial: this.booleanValueField(),
        inhuman: this.booleanValueField(),
        zen: this.booleanValueField(),
        defenseType: this.stringValueField() //define choices
      }),
      modifiers: new SchemaField({
        physicalActions: this.specialAbilityField(),
        allActions: this.specialAbilityField(),
        naturalPenalty: new SchemaField({
          unreduced: this.numberValueField(),
          reduction: this.numberValueField(),
          base: this.numberValueField(),
          special: this.numberValueField(),
          final: this.numberValueField()
        }),
        perceptionPenalty: this.specialAbilityField(),
        extraDamage: this.numberValueField()
      }),
      destinyPoints: this.basicAbilityField(),
      presence: this.numberValueField(),
      aspect: new SchemaField({
        hair: this.stringValueField(),
        eyes: this.stringValueField(),
        height: this.stringValueField(),
        weight: this.stringValueField(),
        age: this.stringValueField(),
        gender: this.stringValueField(),
        race: this.stringValueField(),
        ethnicity: this.stringValueField(),
        appearance: this.stringValueField(),
        size: this.numberValueField()
      }),
      advantages: new ArrayField(new AnyField()),
      contacts: new ArrayField(new AnyField()),
      inventory: new ArrayField(new AnyField()),
      money: new SchemaField({
        cooper: this.numberValueField(),
        silver: this.numberValueField(),
        gold: this.numberValueField()
      }),
      description: this.stringValueField(),
      disadvantages: new ArrayField(new AnyField()),
      elan: new ArrayField(new AnyField()),
      experience: new SchemaField({
        current: this.numberValueField(),
        next: this.numberValueField()
      }),
      languages: new SchemaField({
        base: this.stringValueField(),
        others: new ArrayField(new AnyField())
      }),
      levels: new ArrayField(new AnyField()),
      notes: new ArrayField(new AnyField()),
      titles: new ArrayField(new AnyField())
    });
  }
  static characteristicsData() {
    return new SchemaField({
      primaries: new SchemaField({
        agility: this.characteristicField(),
        constitution: this.characteristicField(),
        dexterity: this.characteristicField(),
        strength: this.characteristicField(),
        intelligence: this.characteristicField(),
        perception: this.characteristicField(),
        power: this.characteristicField(),
        willPower: this.characteristicField()
      }),
      secondaries: new SchemaField({
        lifePoints: this.resourceField(),
        initiative: this.basicAbilityField(),
        fatigue: this.resourceField(),
        regenerationType: new SchemaField({
          mod: this.numberValueField(),
          final: this.numberValueField()
        }),
        regeneration: new SchemaField({
          normal: new SchemaField({
            value: this.numberValueField(),
            period: this.stringValueField()
          }),
          resting: new SchemaField({
            value: this.numberValueField(),
            period: this.stringValueField()
          }),
          recovery: new SchemaField({
            value: this.numberValueField(),
            period: this.stringValueField()
          })
        }),
        movementType: new SchemaField({
          mod: this.numberValueField(),
          final: this.numberValueField()
        }),
        movement: new SchemaField({
          maximum: this.numberValueField(),
          running: this.numberValueField()
        }),
        resistances: new SchemaField({
          physical: this.basicAbilityField(),
          disease: this.basicAbilityField(),
          poison: this.basicAbilityField(),
          magic: this.basicAbilityField(),
          psychic: this.basicAbilityField()
        })
      })
    });
  }
  static secondariesData() {
    return new SchemaField({
      athletics: new SchemaField({
        acrobatics: this.secondarieField('agility'),
        athleticism: this.secondarieField('agility'),
        ride: this.secondarieField('agility'),
        swim: this.secondarieField('agility'),
        climb: this.secondarieField('agility'),
        jump: this.secondarieField('strength'),
        piloting: this.secondarieField('dexterity')
      }),
      vigor: new SchemaField({
        composure: this.secondarieField('willPower'),
        featsOfStrength: this.secondarieField('strength'),
        withstandPain: this.secondarieField('willPower')
      }),
      perception: new SchemaField({
        notice: this.secondarieField('perception'),
        search: this.secondarieField('perception'),
        track: this.secondarieField('perception')
      }),
      intellectual: new SchemaField({
        animals: this.secondarieField('intelligence'),
        science: this.secondarieField('intelligence'),
        law: this.secondarieField('intelligence'),
        herbalLore: this.secondarieField('intelligence'),
        history: this.secondarieField('intelligence'),
        tactics: this.secondarieField('intelligence'),
        medicine: this.secondarieField('intelligence'),
        memorize: this.secondarieField('intelligence'),
        navigation: this.secondarieField('intelligence'),
        occult: this.secondarieField('intelligence'),
        appraisal: this.secondarieField('intelligence'),
        magicAppraisal: this.secondarieField('power')
      }),
      social: new SchemaField({
        style: this.secondarieField('power'),
        intimidate: this.secondarieField('willPower'),
        leadership: this.secondarieField('power'),
        persuasion: this.secondarieField('intelligence'),
        trading: this.secondarieField('intelligence'),
        streetwise: this.secondarieField('intelligence'),
        etiquette: this.secondarieField('intelligence')
      }),
      subterfuge: new SchemaField({
        lockPicking: this.secondarieField('dexterity'),
        disguise: this.secondarieField('dexterity'),
        hide: this.secondarieField('perception'),
        theft: this.secondarieField('dexterity'),
        stealth: this.secondarieField('agility'),
        trapLore: this.secondarieField('dexterity'),
        poisons: this.secondarieField('intelligence')
      }),
      creative: new SchemaField({
        art: this.secondarieField('power'),
        dance: this.secondarieField('agility'),
        forging: this.secondarieField('dexterity'),
        runes: this.secondarieField('dexterity'),
        alchemy: this.secondarieField('intelligence'),
        animism: this.secondarieField('power'),
        music: this.secondarieField('power'),
        sleightOfHand: this.secondarieField('dexterity'),
        ritualCalligraphy: this.secondarieField('dexterity'),
        jewelry: this.secondarieField('dexterity'),
        tailoring: this.secondarieField('dexterity'),
        puppetMaking: this.secondarieField('power')
      }),
      secondarySpecialSkills: new ArrayField(new AnyField())
    });
  }
  static combatData() {
    return new SchemaField({
      attack: this.basicAbilityField(),
      block: this.basicAbilityField(),
      dodge: this.basicAbilityField(),
      wearArmor: this.numberValueField(),
      totalArmor: new SchemaField({
        at: new SchemaField({
          cut: this.numberValueField(),
          impact: this.numberValueField(),
          thrust: this.numberValueField(),
          heat: this.numberValueField(),
          electricity: this.numberValueField(),
          cold: this.numberValueField(),
          energy: this.numberValueField()
        })
      }),
      combatSpecialSkills: new ArrayField(new AnyField()),
      combatTables: new ArrayField(new AnyField()),
      ammo: new ArrayField(new AnyField()),
      weapons: new ArrayField(new AnyField()),
      armors: new ArrayField(new AnyField()),
      supernaturalShields: new ArrayField(new AnyField())
    });
  }
  static mysticData() {
    return new SchemaField({
      act: new SchemaField({
        main: this.basicAbilityField(),
        via: new ArrayField(new AnyField())
      }),
      zeon: new SchemaField({
        accumulated: new AnyField({ initial: 0 }),
        value: new NumberField({ initial: 0 }),
        max: new NumberField({ initial: 0 })
      }),
      zeonMaintained: this.numberValueField(),
      zeonRegeneration: this.basicAbilityField(),
      innateMagic: new SchemaField({
        main: this.basicAbilityField(),
        via: new ArrayField(new AnyField())
      }),
      magicProjection: new SchemaField({
        base: this.numberValueField(),
        final: this.numberValueField(),
        imbalance: new SchemaField({
          offensive: this.basicAbilityField(),
          defensive: this.basicAbilityField()
        })
      }),
      magicLevel: new SchemaField({
        spheres: new SchemaField({
          essence: this.numberValueField(),
          water: this.numberValueField(),
          earth: this.numberValueField(),
          creation: this.numberValueField(),
          darkness: this.numberValueField(),
          necromancy: this.numberValueField(),
          light: this.numberValueField(),
          destruction: this.numberValueField(),
          air: this.numberValueField(),
          fire: this.numberValueField(),
          illusion: this.numberValueField()
        }),
        total: this.numberValueField(),
        used: this.numberValueField()
      }),
      summoning: new SchemaField({
        summon: this.basicAbilityField(),
        banish: this.basicAbilityField(),
        bind: this.basicAbilityField(),
        control: this.basicAbilityField()
      }),
      mysticSettings: new SchemaField({
        aptitudeForMagicDevelopment: new BooleanField({ initial: false })
      }),
      spells: new ArrayField(new AnyField()),
      spellMaintenances: new ArrayField(new AnyField()),
      selectedSpells: new ArrayField(new AnyField()),
      summons: new ArrayField(new AnyField()),
      metamagics: new ArrayField(new AnyField()),
      preparedSpells: new ArrayField(new AnyField())
    });
  }
  static domineData() {
    return new SchemaField({
      kiSkills: new ArrayField(new AnyField()),
      nemesisSkills: new ArrayField(new AnyField()),
      arsMagnus: new ArrayField(new AnyField()),
      martialArts: new ArrayField(new AnyField()),
      creatures: new ArrayField(new AnyField()),
      specialSkills: new ArrayField(new AnyField()),
      techniques: new ArrayField(new AnyField()),
      seals: new SchemaField({
        minor: new SchemaField({
          fire: this.sealField(),
          metal: this.sealField(),
          wind: this.sealField(),
          water: this.sealField(),
          wood: this.sealField()
        }),
        major: new SchemaField({
          fire: this.sealField(),
          metal: this.sealField(),
          wind: this.sealField(),
          water: this.sealField(),
          wood: this.sealField()
        })
      }),
      martialKnowledge: new SchemaField({
        used: this.numberValueField(),
        max: this.numberValueField()
      }),
      kiAccumulation: new SchemaField({
        strength: this.kiAccumulationField(),
        agility: this.kiAccumulationField(),
        dexterity: this.kiAccumulationField(),
        constitution: this.kiAccumulationField(),
        willPower: this.kiAccumulationField(),
        power: this.kiAccumulationField(),
        generic: this.resourceField()
      })
    });
  }
  static psychicData() {
    return new SchemaField({
      psychicPotential: this.basicAbilityField(),
      psychicProjection: new SchemaField({
        base: this.numberValueField(),
        final: this.numberValueField(),
        imbalance: new SchemaField({
          offensive: this.basicAbilityField(),
          defensive: this.basicAbilityField()
        })
      }),
      psychicPoints: this.resourceField(),
      psychicSettings: new SchemaField({
        fatigueResistance: new BooleanField({ initial: false })
      }),
      psychicPowers: new ArrayField(new AnyField()),
      psychicDisciplines: new ArrayField(new AnyField()),
      mentalPatterns: new ArrayField(new AnyField()),
      innatePsychicPower: new SchemaField({ amount: this.numberValueField() }),
      innatePsychicPowers: new ArrayField(new AnyField())
    });
  }
}
