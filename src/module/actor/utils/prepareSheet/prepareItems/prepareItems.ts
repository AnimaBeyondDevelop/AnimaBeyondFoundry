import { ABFActor } from '../../../ABFActor';
import { attachFreeAccessSpells } from './attachFreeAccessSpells';
import { attachSecondarySkill } from './attachSecondarySkill';
import { attachCommonItem } from './attachCommonItem';
import { attachSpellMaintenances } from './attachSpellMaintenances';
import { attachSelectedSpells } from './attachSelectedSpells';
import { Items } from './Items';
import { attachSummon } from './attachSummon';
import { attachMetamagics } from './attachMetamagics';
import { attachLevels } from './attachLevels';
import { attachLanguages } from './attachLanguages';
import { attachElan } from './attachElan';
import { attachTitles } from './attachTitles';
import { attachAdvantages } from './attachAdvantages';
import { attachDisadvantages } from './attachDisadvantages';
import { attachContacts } from './attachContacts';
import { attachNotes } from './attachNotes';
import { attachPsychicDisciplines } from './attachPsychicDisciplines';
import { attachMentalPatterns } from './attachMentalPatterns';
import { attachInnatePsychicPowers } from './attachInnatePsychicPowers';
import { attachPsychicPowers } from './attachPsychicPowers';
import { attachKiSkills } from './attachKiSkills';
import { attachNemesisSkills } from './attachNemesisSkills';
import { attachArsMagnus } from './attachArsMagnus';
import { attachMartialArts } from './attachMartialArts';
import { attachCreatures } from './attachCreatures';
import { attachTechniques } from './attachTechniques';
import { attachSpecialSkills } from './attachSpecialSkills';

export const prepareItems = (data: ActorSheet.Data<ABFActor>) => {
  let newData: ActorSheet.Data<ABFActor> = JSON.parse(JSON.stringify(data));

  const VALID_ITEM_TYPES = [
    Items.SECONDARY_SKILL,
    Items.FREE_ACCESS_SPELL,
    Items.SPELL_MAINTENANCE,
    Items.SELECTED_SPELL,
    Items.METAMAGIC,
    Items.SUMMON,
    Items.LEVEL,
    Items.LANGUAGE,
    Items.ELAN,
    Items.TITLE,
    Items.ADVANTAGE,
    Items.DISADVANTAGE,
    Items.CONTACT,
    Items.NOTE,
    Items.PSYCHIC_DISCIPLINE,
    Items.MENTAL_PATTERN,
    Items.INNATE_PSYCHIC_POWER,
    Items.PSYCHIC_POWER,
    Items.KI_SKILL,
    Items.NEMESIS_SKILL,
    Items.ARS_MAGNUS,
    Items.MARTIAL_ART,
    Items.CREATURE,
    Items.SPECIAL_SKILL,
    Items.TECHNIQUE,
  ].map(type => type.toString());

  for (const item of newData.items) {
    if (VALID_ITEM_TYPES.includes(item.type)) {
      item.img = item.img || CONST.DEFAULT_TOKEN;

      switch (item.type) {
        case Items.FREE_ACCESS_SPELL:
          newData = attachFreeAccessSpells(newData, item);
          break;
        case Items.SECONDARY_SKILL:
          newData = attachSecondarySkill(newData, item);
          break;
        case Items.SPELL_MAINTENANCE:
          newData = attachSpellMaintenances(newData, item);
          break;
        case Items.SELECTED_SPELL:
          newData = attachSelectedSpells(newData, item);
          break;
        case Items.SUMMON:
          newData = attachSummon(newData, item);
          break;
        case Items.METAMAGIC:
          newData = attachMetamagics(newData, item);
          break;
        case Items.LEVEL:
          newData = attachLevels(newData, item);
          break;
        case Items.LANGUAGE:
          newData = attachLanguages(newData, item);
          break;
        case Items.ELAN:
          newData = attachElan(newData, item);
          break;
        case Items.TITLE:
          newData = attachTitles(newData, item);
          break;
        case Items.ADVANTAGE:
          newData = attachAdvantages(newData, item);
          break;
        case Items.DISADVANTAGE:
          newData = attachDisadvantages(newData, item);
          break;
        case Items.CONTACT:
          newData = attachContacts(newData, item);
          break;
        case Items.NOTE:
          newData = attachNotes(newData, item);
          break;
        case Items.PSYCHIC_DISCIPLINE:
          newData = attachPsychicDisciplines(newData, item);
          break;
        case Items.MENTAL_PATTERN:
          newData = attachMentalPatterns(newData, item);
          break;
        case Items.INNATE_PSYCHIC_POWER:
          newData = attachInnatePsychicPowers(newData, item);
          break;
        case Items.PSYCHIC_POWER:
          newData = attachPsychicPowers(newData, item);
          break;
        case Items.KI_SKILL:
          newData = attachKiSkills(newData, item);
          break;
        case Items.NEMESIS_SKILL:
          newData = attachNemesisSkills(newData, item);
          break;
        case Items.ARS_MAGNUS:
          newData = attachArsMagnus(newData, item);
          break;
        case Items.MARTIAL_ART:
          newData = attachMartialArts(newData, item);
          break;
        case Items.CREATURE:
          newData = attachCreatures(newData, item);
          break;
        case Items.SPECIAL_SKILL:
          newData = attachSpecialSkills(newData, item);
          break;
        case Items.TECHNIQUE:
          newData = attachTechniques(newData, item);
          break;
        default:
          newData = attachCommonItem(newData, item);
          break;
      }
    } else {
      console.warn(`Item with ${item.type} unrecognized. Skipping...`, { item });
    }
  }

  return newData;
};
