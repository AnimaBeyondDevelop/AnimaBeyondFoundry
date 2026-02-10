// module/utils/constants.js
import { System } from '../../utils/systemMeta.js';

// Helper to build template paths dynamically
const T = p => `systems/${System.id}/templates/${p}`;

export const Templates = {
  Dialog: {
    ModDialog: T('dialog/mod-dialog.html'),
    DamageCalculator: T('dialog/damage-calculator.hbs'),
    newPreparedSpell: T('dialog/new-prepared-spell.hbs'),
    newSelectedSpell: T('dialog/new-selected-spell.hbs'),
    newSupernaturalShield: {
      main: T('dialog/new-supernatural-shield/new-supernatural-shield.hbs'),
      parts: {
        mystic: T('dialog/new-supernatural-shield/parts/new-mystic-shield.hbs'),
        psychic: T('dialog/new-supernatural-shield/parts/new-psychic-shield.hbs')
      }
    },
    newActVia: T('dialog/new-act-via.hbs'),
    newPsychicDiscipline: T('dialog/new-psychic-discipline.hbs'),
    newMentalPattern: T('dialog/new-mental-pattern.hbs'),
    Combat: {
      CombatAttackDialog: {
        main: T('dialog/combat/combat-attack/combat-attack-dialog.hbs'),
        parts: {
          combat: T('dialog/combat/combat-attack/parts/combat.hbs'),
          mystic: T('dialog/combat/combat-attack/parts/mystic.hbs'),
          psychic: T('dialog/combat/combat-attack/parts/psychic.hbs')
        }
      },
      CombatDefenseDialog: {
        main: T('dialog/combat/combat-defense/combat-defense-dialog.hbs'),
        parts: {
          combat: T('dialog/combat/combat-defense/parts/combat.hbs'),
          damageResistance: T('dialog/combat/combat-defense/parts/damage-resistance.hbs'),
          mystic: T('dialog/combat/combat-defense/parts/mystic.hbs'),
          psychic: T('dialog/combat/combat-defense/parts/psychic.hbs')
        }
      },
      CombatRequestDialog: T('dialog/combat/combat-request-dialog.hbs'),
      GMCombatDialog: T('dialog/combat/gm-combat-dialog.hbs'),
      DefenseConfigDialog: T('dialog/combat/defense-config-dialog.hbs'),
      AttackConfigDialog: T('dialog/combat/attack-config-dialog.hbs')
    },
    GenericDialog: T('dialog/generic-dialog/generic-dialog.hbs'),
    Icons: {
      Accept: T('dialog/parts/check-icon.hbs'),
      Cancel: T('dialog/parts/cancel-icon.hbs')
    },
    Config: {
      ModifyDiceFormulas: T('dialog/config/modify-dice-formulas.hbs')
    },
    SpellShieldConfigDialog: T('dialog/spell-shield-config-dialog.hbs'),
    SpellAttackConfigDialog: T('dialog/spell-attack-config-dialog.hbs')
  },

  CustomHotBar: T('custom-hotbar/custom-hotbar.hbs'),

  Chat: {
    CombatResult: T('chat/combat-result.hbs'),
    AutoCombatResult: T('chat/auto-combat-result.hbs'),
    AttackData: T('chat/attack-data.hbs'),
    MultiDefenseResult: T('chat/multi-defense-result.hbs'),
    AttackTargetsChips: T('chat/attack-targets-chips.hbs')
  },

  // --- Added from your previous manual list ---
  UI: {
    HorizontalTitledInput: T('common/ui/horizontal-titled-input.hbs'),
    VerticalTitledInput: T('common/ui/vertical-titled-input.hbs'),
    Group: T('common/ui/group.hbs'),
    GroupHeader: T('common/ui/group-header.hbs'),
    GroupHeaderTitle: T('common/ui/group-header-title.hbs'),
    GroupBody: T('common/ui/group-body.hbs'),
    GroupFooter: T('common/ui/group-footer.hbs'),
    AddItemButton: T('common/ui/add-item-button.hbs'),
    CustomSelect: T('common/ui/custom-select.hbs'),
    CustomSelectChoices: T('common/ui/custom-select-choices.hbs'),
    LoadingIndicator: T('common/ui/loading-indicator.hbs'),
    Characteristic: T('common/ui/characteristic.hbs'),
    NumericalValue: T('common/ui/numerical-value.hbs'),
    BaseTypeWrapper: T('common/ui/base-type-wrapper.hbs')
  },

  Apps: {
    GenericBaseTypeEditor: T('apps/generic-base-type-editor.hbs')
  },

  Domain: {
    Weapon: {
      OneOrTwoHanded: T('common/domain/weapon/one-or-two-handed.hbs'),
      KnowledgeType: T('common/domain/weapon/knowledge-type.hbs'),
      SelectAmmo: T('common/domain/weapon/select-ammo.hbs')
    },
    Armor: {
      SelectArmorType: T('common/domain/armor/select-armor-type.hbs'),
      SelectArmorLocalization: T('common/domain/armor/select-armor-localization.hbs')
    },
    SelectQuality: T('common/domain/select-quality.hbs')
  },

  Items: {
    BaseSheet: T('items/base/base-sheet.hbs'),
    ItemImage: T('items/base/parts/item-image.hbs'),
    Weapon: T('items/weapon/weapon.hbs'),
    Ammo: T('items/ammo/ammo.hbs'),
    Armor: T('items/armor/armor.hbs'),
    Spell: T('items/spell/spell.hbs'),
    PsychicPower: T('items/psychicPower/psychicPower.hbs')
  },

  Actor: {
    Header: {
      Main: T('actor/parts/header/header.hbs'),
      Top: T('actor/parts/header/parts/top.hbs'),
      ActorImage: T('actor/parts/header/parts/actor-image.hbs'),
      TotalArmor: T('actor/parts/header/parts/total-armor.hbs'),
      CommonResources: T('actor/parts/header/parts/common-resources.hbs'),
      Modifiers: T('actor/parts/header/parts/modifiers.hbs'),
      PrimaryCharacteristics: T('actor/parts/header/parts/primary-characteristics.hbs'),
      Resistances: T('actor/parts/header/parts/resistances.hbs')
    },

    General: {
      Main: T('actor/parts/general/general.hbs'),
      Level: T('actor/parts/general/parts/level.hbs'),
      Language: T('actor/parts/general/parts/language.hbs'),
      Elan: T('actor/parts/general/parts/elan.hbs'),
      Titles: T('actor/parts/general/parts/titles.hbs'),
      DestinyPoints: T('actor/parts/general/parts/destiny-points.hbs'),
      Presence: T('actor/parts/general/parts/presence.hbs'),
      Experience: T('actor/parts/general/parts/experience.hbs'),
      Advantages: T('actor/parts/general/parts/advantages.hbs'),
      Disadvantages: T('actor/parts/general/parts/disadvantages.hbs'),
      Aspect: T('actor/parts/general/parts/aspect.hbs'),
      Description: T('actor/parts/general/parts/description.hbs'),
      Regeneration: T('actor/parts/general/parts/regeneration.hbs'),
      Contacts: T('actor/parts/general/parts/contacts.hbs'),
      Notes: T('actor/parts/general/parts/notes.hbs'),
      InventoryItems: T('actor/parts/general/parts/inventory-items.hbs'),
      Money: T('actor/parts/general/parts/money.hbs')
    },

    Secondaries: {
      Main: T('actor/parts/secondaries/secondaries.hbs'),
      SecondarySkill: T('actor/parts/secondaries/common/secondary-skill.hbs'),
      Athletics: T('actor/parts/secondaries/parts/athletics.hbs'),
      Vigor: T('actor/parts/secondaries/parts/vigor.hbs'),
      Perception: T('actor/parts/secondaries/parts/perception.hbs'),
      Intellectual: T('actor/parts/secondaries/parts/intellectual.hbs'),
      Subterfuge: T('actor/parts/secondaries/parts/subterfuge.hbs'),
      Social: T('actor/parts/secondaries/parts/social.hbs'),
      Creative: T('actor/parts/secondaries/parts/creative.hbs'),
      SecondarySpecialSkills: T(
        'actor/parts/secondaries/parts/secondary-special-skills.hbs'
      )
    },

    Combat: {
      Main: T('actor/parts/combat/combat.hbs'),
      BaseValues: T('actor/parts/combat/parts/base-values.hbs'),
      CombatSpecialSkills: T('actor/parts/combat/parts/combat-special-skills.hbs'),
      CombatTables: T('actor/parts/combat/parts/combat-tables.hbs'),
      Ammo: T('actor/parts/combat/parts/ammo.hbs'),
      Armors: T('actor/parts/combat/parts/armors.hbs'),
      Weapons: T('actor/parts/combat/parts/weapons.hbs'),
      SupernaturalShields: T('actor/parts/combat/parts/supernatural-shields.hbs')
    },

    Mystic: {
      Main: T('actor/parts/mystic/mystic.hbs'),
      Act: T('actor/parts/mystic/parts/act.hbs'),
      MagicProjection: T('actor/parts/mystic/parts/magic-projection.hbs'),
      ZeonRegeneration: T('actor/parts/mystic/parts/zeon-regeneration.hbs'),
      InnateMagic: T('actor/parts/mystic/parts/innate-magic.hbs'),
      Zeon: T('actor/parts/mystic/parts/zeon.hbs'),
      MysticSettings: T('actor/parts/mystic/parts/mystic-settings.hbs'),
      Summoning: T('actor/parts/mystic/parts/summoning.hbs'),
      Spheres: T('actor/parts/mystic/parts/spheres.hbs'),
      Spells: T('actor/parts/mystic/parts/spells/spells.hbs'),
      Grade: T('actor/parts/mystic/parts/spells/grade/grade.hbs'),
      SpellMaintenances: T('actor/parts/mystic/parts/spell-maintenances.hbs'),
      SelectedSpells: T('actor/parts/mystic/parts/selected-spells.hbs'),
      PreparedSpells: T('actor/parts/mystic/parts/prepared-spells.hbs'),
      Summons: T('actor/parts/mystic/parts/summons.hbs'),
      Metamagics: T('actor/parts/mystic/parts/metamagics.hbs')
    },

    Domine: {
      Main: T('actor/parts/domine/domine.hbs'),
      KiSkills: T('actor/parts/domine/parts/ki-skills.hbs'),
      NemesisSkills: T('actor/parts/domine/parts/nemesis-skills.hbs'),
      ArsMagnus: T('actor/parts/domine/parts/ars-magnus.hbs'),
      MartialArts: T('actor/parts/domine/parts/martial-arts.hbs'),
      Creatures: T('actor/parts/domine/parts/creatures.hbs'),
      SpecialSkillsTables: T('actor/parts/domine/parts/special-skills-tables.hbs'),
      KiAccumulation: T('actor/parts/domine/parts/ki-accumulation.hbs'),
      MartialKnowledge: T('actor/parts/domine/parts/martial-knowledge.hbs'),
      Seals: T('actor/parts/domine/parts/seals.hbs'),
      Techniques: T('actor/parts/domine/parts/techniques.hbs')
    },

    Psychic: {
      Main: T('actor/parts/psychic/psychic.hbs'),
      PsychicPotential: T('actor/parts/psychic/parts/psychic-potential.hbs'),
      PsychicProjection: T('actor/parts/psychic/parts/psychic-projection.hbs'),
      MentalPatterns: T('actor/parts/psychic/parts/mental-patterns.hbs'),
      InnatePsychicPowers: T('actor/parts/psychic/parts/innate-psychic-powers.hbs'),
      PsychicPoints: T('actor/parts/psychic/parts/psychic-points.hbs'),
      PsychicSettings: T('actor/parts/psychic/parts/psychic-settings.hbs'),
      PsychicDisciplines: T('actor/parts/psychic/parts/psychic-disciplines.hbs'),
      PsychicPowers: T('actor/parts/psychic/parts/psychic-powers.hbs')
    },

    Effects: {
      Main: T('actor/parts/effects/effects.hbs'),
      EffectsList: T('actor/parts/effects/parts/effects-list.hbs')
    },

    Settings: {
      Main: T('actor/parts/settings/settings.hbs'),
      TabVisibility: T('actor/parts/settings/parts/tabVisibility.hbs'),
      AutomationOptions: T('actor/parts/settings/parts/automationOptions.hbs'),
      AdvancedSettings: T('actor/parts/settings/parts/advancedSettings.hbs'),
      AdvancedCharacteristics: T('actor/parts/settings/parts/advancedCharacteristics.hbs')
    }
  }
};

export const HandlebarsPartials = {
  'ui/group': Templates.UI.Group,
  'ui/group-header': Templates.UI.GroupHeader,
  'ui/group-body': Templates.UI.GroupBody,
  'ui/group-footer': Templates.UI.GroupFooter,
  'ui/horizontal-titled-input': Templates.UI.HorizontalTitledInput,
  'ui/vertical-titled-input': Templates.UI.VerticalTitledInput,
  'ui/custom-select': Templates.UI.CustomSelect,
  'ui/loading-indicator': Templates.UI.LoadingIndicator,
  'ui/group-header-title': Templates.UI.GroupHeaderTitle,
  'ui/add-item-button': Templates.UI.AddItemButton,
  'ui/custom-select-choices': Templates.UI.CustomSelectChoices,
  'ui/characteristic': Templates.UI.Characteristic,
  'ui/numerical-value': Templates.UI.NumericalValue,
  'ui/base-type-wrapper': Templates.UI.BaseTypeWrapper
};
