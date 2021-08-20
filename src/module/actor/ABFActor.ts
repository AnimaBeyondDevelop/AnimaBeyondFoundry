import { openDialog } from '../utils/openDialog';
import { SkillChange } from '../types/SkillChange';
import { FreeAccessSpellChange } from '../types/FreeAccessSpellChange';
import { SelectedSpellsChange } from '../types/SelectedSpellsChange';
import { prepareActor } from './utils/prepareActor/prepareActor';
import { Items } from './utils/prepareSheet/prepareItems/Items';
import { MetamagicChanges } from '../types/MetamagicChange';
import { SummonChanges } from '../types/SummonChange';
import { SpellMaintenancesChanges } from '../types/SpellMaintenancesChange';
import { LevelChanges } from '../types/LevelChange';
import { LanguageChanges } from '../types/LanguageChange';
import { ElanPowerChanges } from '../types/ElanPowerChanges';
import { ElanChanges } from '../types/ElanChanges';
import { nanoid } from '../../vendor/nanoid/nanoid';
import { TitleChanges } from '../types/TitleChange';
import { AdvantageChange } from '../types/AdvantageChange';
import { ContactChange } from '../types/ContactChange';
import { DisadvantageChange } from '../types/DisadvantageChange';
import { NoteChange } from '../types/NoteChange';
import { PsychicDisciplineChanges } from '../types/PsychicDisciplineChanges';
import { MentalPatternChanges } from '../types/MentalPatternChanges';
import { InnatePsychicPowerChanges } from '../types/InnatePsychicPowerChanges';
import { PsychicPowerChanges } from '../types/PsychicPowerChanges';
import { KiSkillsChanges } from '../types/KiSkillsChanges';
import { NemesisSkillsChanges } from '../types/NemesisSkillsChanges';
import { ArsMagnusChanges } from '../types/ArsMagnusChanges';
import { MartialArtsChanges } from '../types/MartialArtsChanges';
import { CreaturesChanges } from '../types/CreaturesChanges';
import { TechniquesChanges } from '../types/TechniquesChanges';
import { SpecialSkillsChanges } from '../types/SpecialSkillsChanges';
import { Character } from './ABFActor.type';

export type CharacterData = Character & Actor.Data;

export class ABFActor extends Actor<CharacterData> {
  prepareData() {
    super.prepareData();

    const actorData = this.data;

    if (actorData.type === 'character') {
      this.data = prepareActor(actorData);
    }
  }

  public async addSummon(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.summon.content')
    });

    const itemData = { name, type: Items.SUMMON, cost: { value: 0 } };

    await this.createOwnedItem(itemData);
  }

  public editSummon(invocation: SummonChanges) {
    for (const id of Object.keys(invocation)) {
      const { name, data } = invocation[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data
      });
    }
  }

  public async addSelectedSpell(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.selectedSpell.content')
    });

    const itemData = { name, type: Items.SELECTED_SPELL, cost: { value: 0 } };

    await this.createOwnedItem(itemData);
  }

  public editSelectedSpell(changes: SelectedSpellsChange) {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data
      });
    }
  }

  public async addSpellMaintenance(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.spellMaintenance.content')
    });

    const itemData = { name, type: Items.SPELL_MAINTENANCE, cost: { value: 0 } };

    await this.createOwnedItem(itemData);
  }

  public editSpellMaintenance(changes: SpellMaintenancesChanges) {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data
      });
    }
  }

  public async addFreeAccessSpell(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.freeAccessSpell.content')
    });

    const itemData = {
      name,
      type: Items.FREE_ACCESS_SPELL,
      level: { value: 0 },
      cost: { value: 0 }
    };

    await this.createOwnedItem(itemData);
  }

  public editFreeAccessSpells(changes: FreeAccessSpellChange) {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data
      });
    }
  }

  async addSecondarySkillSlot(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.secondarySkill.content')
    });

    const itemData = { name, type: Items.SECONDARY_SKILL, value: 0 };

    await this.createOwnedItem(itemData);
  }

  public editSecondarySkills(skillChanges: SkillChange) {
    for (const id of Object.keys(skillChanges)) {
      const { value } = skillChanges[id].data;

      this.updateOwnedItem({
        _id: id,
        data: {
          value
        }
      });
    }
  }

  public async addMetamagic(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.metamagic.content')
    });

    const itemData = { name, type: Items.METAMAGIC, grade: { value: 0 } };

    await this.createOwnedItem(itemData);
  }

  public editMetamagic(changes: MetamagicChanges) {
    for (const id of Object.keys(changes)) {
      const { name, data } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data
      });
    }
  }

  public async addLevel(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.level.content')
    });

    const itemData = { name, type: Items.LEVEL, level: 0 };

    await this.createOwnedItem(itemData);
  }

  public editLevel(level: LevelChanges) {
    for (const id of Object.keys(level)) {
      const { name, data } = level[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data: {
          level: data.level
        }
      });
    }
  }

  public async addLanguage(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.language.content')
    });

    const itemData = { name, type: Items.LANGUAGE };

    await this.createOwnedItem(itemData);
  }

  public editLanguage(language: LanguageChanges) {
    for (const id of Object.keys(language)) {
      const { name } = language[id];

      this.updateOwnedItem({
        _id: id,
        name
      });
    }
  }

  public async addElanPower(elanId: string): Promise<void> {
    if (!elanId) throw new Error('elanId missing');

    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.elan_power.content')
    });

    const power = { _id: nanoid(), name, level: 0 };

    const elan = await this.getOwnedItem(elanId);

    if (!elan.data.data.powers) {
      elan.data.data.powers = [power];
    } else {
      elan.data.data.powers.push(power);
    }

    await elan.update(elan.data);
  }

  public async removeElanPower(elanId: string, elanPowerId: string): Promise<void> {
    if (!elanId) throw new Error('elanId missing');
    if (!elanPowerId) throw new Error('elanPowerId missing');

    const elan = await this.getOwnedItem(elanId);

    elan.data.data.powers = elan.data.data.powers.filter(
      power => power._id !== elanPowerId
    );

    await elan.update(elan.data);
  }

  public async editElanPower(elanPowers: ElanPowerChanges) {
    for (const id of Object.keys(elanPowers)) {
      const { name, elanId, level } = elanPowers[id];

      if (!elanId) throw new Error('elanId missing');

      const elan = await this.getOwnedItem(elanId);

      const elanPower = elan.data.data.powers.find(power => power._id === id);

      if (elanPower.name === name && elanPower.level === level) continue;

      elanPower.name = name;
      elanPower.level = level;

      await elan.update(elan.data);
    }
  }

  public async addElan(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.elan.content')
    });

    const itemData = {
      name,
      type: Items.ELAN,
      level: 0,
      powers: []
    };

    await this.createOwnedItem(itemData);
  }

  public editElan(elan: ElanChanges) {
    for (const id of Object.keys(elan)) {
      const { name, level } = elan[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data: {
          level
        }
      });
    }
  }

  public async addTitle(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.title.content')
    });

    const itemData = {
      name,
      type: Items.TITLE
    };

    await this.createOwnedItem(itemData);
  }

  public editTitles(titles: TitleChanges) {
    for (const id of Object.keys(titles)) {
      const { name } = titles[id];

      this.updateOwnedItem({
        _id: id,
        name
      });
    }
  }

  public async addAdvantage(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.advantage.content')
    });

    const itemData = {
      name,
      type: Items.ADVANTAGE
    };

    await this.createOwnedItem(itemData);
  }

  public editAdvantages(advantages: AdvantageChange) {
    for (const id of Object.keys(advantages)) {
      const { name } = advantages[id];

      this.updateOwnedItem({
        _id: id,
        name
      });
    }
  }

  public async addDisadvantage(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.disadvantage.content')
    });

    const itemData = {
      name,
      type: Items.DISADVANTAGE
    };

    await this.createOwnedItem(itemData);
  }

  public editDisadvantages(disadvantages: DisadvantageChange) {
    for (const id of Object.keys(disadvantages)) {
      const { name } = disadvantages[id];

      this.updateOwnedItem({
        _id: id,
        name
      });
    }
  }

  public async addContact(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.contact.content')
    });

    const itemData = {
      name,
      type: Items.CONTACT
    };

    await this.createOwnedItem(itemData);
  }

  public editContacts(contacts: ContactChange) {
    for (const id of Object.keys(contacts)) {
      const { name, description } = contacts[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data: { description }
      });
    }
  }

  public async addNote(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.note.content')
    });

    const itemData = {
      name,
      type: Items.NOTE
    };

    await this.createOwnedItem(itemData);
  }

  public editNotes(notes: NoteChange) {
    for (const id of Object.keys(notes)) {
      const { name } = notes[id];

      this.updateOwnedItem({
        _id: id,
        name
      });
    }
  }

  public async addPsychicDiscipline(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.psychicDiscipline.content')
    });

    const itemData = {
      name,
      type: Items.PSYCHIC_DISCIPLINE
    };

    await this.createOwnedItem(itemData);
  }

  public editPsychicDisciplines(changes: PsychicDisciplineChanges) {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name
      });
    }
  }

  public async addMentalPattern(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.mentalPattern.content')
    });

    const itemData = {
      name,
      type: Items.MENTAL_PATTERN,
      data: {
        bonus: 0,
        penalty: 0
      }
    };

    await this.createOwnedItem(itemData);
  }

  public editMentalPatterns(changes: MentalPatternChanges) {
    for (const id of Object.keys(changes)) {
      const { name, bonus, penalty } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data: {
          bonus,
          penalty
        }
      });
    }
  }

  public async addInnatePsychicPower(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.innatePsychicPower.content')
    });

    const itemData = {
      name,
      type: Items.INNATE_PSYCHIC_POWER,
      data: {
        effect: '',
        value: 0
      }
    };

    await this.createOwnedItem(itemData);
  }

  public editInnatePsychicPowers(changes: InnatePsychicPowerChanges) {
    for (const id of Object.keys(changes)) {
      const { name, effect, value } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data: {
          effect,
          value
        }
      });
    }
  }

  public async addPsychicPower(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.psychicPower.content')
    });

    const itemData = {
      name,
      type: Items.PSYCHIC_POWER,
      data: {
        level: { value: 0 },
        effects: new Array(8).fill({ value: '' }),
        actionType: { value: '' },
        hasMaintenance: { value: false },
        bonus: { value: 0 }
      }
    };

    await this.createOwnedItem(itemData);
  }

  public editPsychicPowers(changes: PsychicPowerChanges) {
    for (const id of Object.keys(changes)) {
      const {
        name,
        bonus,
        actionType,
        effects: effectsObject,
        hasMaintenance,
        level
      } = changes[id];

      const effects = [];

      for (const key of Object.keys(effectsObject)) {
        effects[key] = { value: effectsObject[key] };
      }

      this.updateOwnedItem({
        _id: id,
        name,
        data: {
          level: { value: level },
          effects,
          actionType: { value: actionType },
          hasMaintenance: { value: hasMaintenance === true },
          bonus: { value: bonus }
        }
      });
    }
  }

  public async addKiSkill(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.kiSkill.content')
    });

    const itemData = {
      name,
      type: Items.KI_SKILL
    };

    await this.createOwnedItem(itemData);
  }

  public editKiSkills(changes: KiSkillsChanges) {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name
      });
    }
  }

  public async addNemesisSkill(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.nemesisSkill.content')
    });

    const itemData = {
      name,
      type: Items.NEMESIS_SKILL
    };

    await this.createOwnedItem(itemData);
  }

  public editNemesisSkills(changes: NemesisSkillsChanges) {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name
      });
    }
  }

  public async addArsMagnus(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.arsMagnus.content')
    });

    const itemData = {
      name,
      type: Items.ARS_MAGNUS
    };

    await this.createOwnedItem(itemData);
  }

  public editArsMagnus(changes: ArsMagnusChanges) {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name
      });
    }
  }

  public async addMartialArt(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.martialArt.content')
    });

    const itemData = {
      name,
      type: Items.MARTIAL_ART,
      data: {
        grade: { value: '' }
      }
    };

    await this.createOwnedItem(itemData);
  }

  public editMartialArts(changes: MartialArtsChanges) {
    for (const id of Object.keys(changes)) {
      const { name, grade } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data: { grade: { value: grade } }
      });
    }
  }

  public async addCreature(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.creature.content')
    });

    const itemData = {
      name,
      type: Items.CREATURE,
      data: {
        earth: {
          value: false
        },
        fire: {
          value: false
        },
        metal: {
          value: false
        },
        water: {
          value: false
        },
        wood: {
          value: false
        }
      }
    };

    await this.createOwnedItem(itemData);
  }

  public editCreatures(changes: CreaturesChanges) {
    for (const id of Object.keys(changes)) {
      const {
        name, earth, fire, metal, water, wood
      } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data: {
          earth: {
            value: earth === true
          },
          fire: {
            value: fire === true
          },
          metal: {
            value: metal === true
          },
          water: {
            value: water === true
          },
          wood: {
            value: wood === true
          }
        }
      });
    }
  }

  public async addSpecialSkill(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.specialSkill.content')
    });

    const itemData = {
      name,
      type: Items.SPECIAL_SKILL
    };

    await this.createOwnedItem(itemData);
  }

  public editSpecialSkills(changes: SpecialSkillsChanges) {
    for (const id of Object.keys(changes)) {
      const { name } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name
      });
    }
  }

  public async addTechnique(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.technique.content')
    });

    const itemData = {
      name,
      type: Items.TECHNIQUE,
      data: {
        description: { value: '' },
        level: { value: 0 },
        strength: { value: 0 },
        agility: { value: 0 },
        dexterity: { value: 0 },
        constitution: { value: 0 },
        willPower: { value: 0 },
        power: { value: 0 },
        martialKnowledge: { value: 0 }
      }
    };

    await this.createOwnedItem(itemData);
  }

  public editTechniques(changes: TechniquesChanges) {
    for (const id of Object.keys(changes)) {
      const {
        name,
        level,
        constitution,
        power,
        willPower,
        agility,
        dexterity,
        description,
        martialKnowledge,
        strength
      } = changes[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data: {
          description: { value: description },
          level: { value: level },
          strength: { value: strength },
          agility: { value: agility },
          dexterity: { value: dexterity },
          constitution: { value: constitution },
          willPower: { value: willPower },
          power: { value: power },
          martialKnowledge: { value: martialKnowledge }
        }
      });
    }
  }
}
