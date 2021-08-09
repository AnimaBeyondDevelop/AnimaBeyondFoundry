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

export class ABFActor extends Actor {
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
}
