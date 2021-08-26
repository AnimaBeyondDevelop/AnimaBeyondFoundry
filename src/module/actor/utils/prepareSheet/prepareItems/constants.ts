import { ABFItems } from './ABFItems';

export const VALID_ITEM_TYPES = [
  ABFItems.SECONDARY_SPECIAL_SKILL,
  ABFItems.FREE_ACCESS_SPELL,
  ABFItems.SPELL_MAINTENANCE,
  ABFItems.SELECTED_SPELL,
  ABFItems.METAMAGIC,
  ABFItems.SUMMON,
  ABFItems.LEVEL,
  ABFItems.LANGUAGE,
  ABFItems.ELAN,
  ABFItems.TITLE,
  ABFItems.ADVANTAGE,
  ABFItems.DISADVANTAGE,
  ABFItems.CONTACT,
  ABFItems.NOTE,
  ABFItems.PSYCHIC_DISCIPLINE,
  ABFItems.MENTAL_PATTERN,
  ABFItems.INNATE_PSYCHIC_POWER,
  ABFItems.PSYCHIC_POWER,
  ABFItems.KI_SKILL,
  ABFItems.NEMESIS_SKILL,
  ABFItems.ARS_MAGNUS,
  ABFItems.MARTIAL_ART,
  ABFItems.CREATURE,
  ABFItems.SPECIAL_SKILL,
  ABFItems.TECHNIQUE,
  ABFItems.COMBAT_SPECIAL_SKILL,
  ABFItems.COMBAT_TABLE,
  ABFItems.AMMO,
  ABFItems.WEAPON
].map(type => type.toString());

export type AttachConfiguration = { fieldPath: string[] };

export const ATTACH_CONFIGURATIONS: {
  [key in ABFItems]: AttachConfiguration;
} = {
  [ABFItems.SECONDARY_SPECIAL_SKILL]: {
    fieldPath: ['secondaries', 'secondarySpecialSkills']
  },
  [ABFItems.FREE_ACCESS_SPELL]: {
    fieldPath: ['mystic', 'freeAccessSpells']
  },
  [ABFItems.SPELL_MAINTENANCE]: {
    fieldPath: ['mystic', 'spellMaintenances']
  },
  [ABFItems.SELECTED_SPELL]: {
    fieldPath: ['mystic', 'selectedSpells']
  },
  [ABFItems.METAMAGIC]: {
    fieldPath: ['mystic', 'metamagics']
  },
  [ABFItems.SUMMON]: {
    fieldPath: ['mystic', 'summons']
  },
  [ABFItems.LEVEL]: {
    fieldPath: ['general', 'levels']
  },
  [ABFItems.LANGUAGE]: {
    fieldPath: ['general', 'languages', 'others']
  },
  [ABFItems.ELAN]: {
    fieldPath: ['general', 'elan']
  },
  [ABFItems.TITLE]: {
    fieldPath: ['general', 'titles']
  },
  [ABFItems.ADVANTAGE]: {
    fieldPath: ['general', 'advantages']
  },
  [ABFItems.DISADVANTAGE]: {
    fieldPath: ['general', 'disadvantages']
  },
  [ABFItems.CONTACT]: {
    fieldPath: ['general', 'contacts']
  },
  [ABFItems.NOTE]: {
    fieldPath: ['general', 'notes']
  },
  [ABFItems.PSYCHIC_DISCIPLINE]: {
    fieldPath: ['psychic', 'psychicDisciplines']
  },
  [ABFItems.MENTAL_PATTERN]: {
    fieldPath: ['psychic', 'mentalPatterns']
  },
  [ABFItems.INNATE_PSYCHIC_POWER]: {
    fieldPath: ['psychic', 'innatePsychicPowers']
  },
  [ABFItems.PSYCHIC_POWER]: {
    fieldPath: ['psychic', 'psychicPowers']
  },
  [ABFItems.KI_SKILL]: {
    fieldPath: ['domine', 'kiSkills']
  },
  [ABFItems.NEMESIS_SKILL]: {
    fieldPath: ['domine', 'nemesisSkills']
  },
  [ABFItems.ARS_MAGNUS]: {
    fieldPath: ['domine', 'arsMagnus']
  },
  [ABFItems.MARTIAL_ART]: {
    fieldPath: ['domine', 'martialArts']
  },
  [ABFItems.CREATURE]: {
    fieldPath: ['domine', 'creatures']
  },
  [ABFItems.SPECIAL_SKILL]: {
    fieldPath: ['domine', 'specialSkills']
  },
  [ABFItems.TECHNIQUE]: {
    fieldPath: ['domine', 'techniques']
  },
  [ABFItems.COMBAT_SPECIAL_SKILL]: {
    fieldPath: ['combat', 'combatSpecialSkills']
  },
  [ABFItems.COMBAT_TABLE]: {
    fieldPath: ['combat', 'combatTables']
  },
  [ABFItems.AMMO]: {
    fieldPath: ['combat', 'ammo']
  },
  [ABFItems.WEAPON]: {
    fieldPath: ['combat', 'weapons']
  }
};
