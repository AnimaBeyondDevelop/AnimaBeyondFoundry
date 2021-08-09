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
    Items.NOTE
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
