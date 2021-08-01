import { openDialog } from '../utils/openDialog';
import { SkillChange } from '../types/SkillChange';
import { FreeAccessSpellChange } from '../types/FreeAccessSpellChange';
import { SelectedSpellsChange } from '../types/SelectedSpellsChange';
import { prepareActor } from './utils/prepareActor/prepareActor';
import { Items } from './utils/prepareSheet/prepareItems/Items';
import { MetamagicChanges } from '../types/MetamagicChange';
import { InvocationChanges } from '../types/InvocationChange';
import { MaintenancesChanges } from '../types/MaintenancesChange';
import { LevelChanges } from '../types/LevelChange';
import { LanguageChanges } from '../types/LanguageChange';
import { ElanPowerChanges } from '../types/ElanPowerChanges';
import { ElanChanges } from '../types/ElanChanges';
import { nanoid } from '../../vendor/nanoid/nanoid';

export class ABFActor extends Actor {
  prepareData() {
    super.prepareData();

    const actorData = this.data;

    if (actorData.type === 'character') {
      this.data = prepareActor(actorData);
    }
  }

  public async addInvocation(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.invocation.content')
    });

    const itemData = { name, type: Items.INVOCATION, cost: 0 };

    await this.createOwnedItem(itemData);
  }

  public editInvocation(invocation: InvocationChanges) {
    for (const id of Object.keys(invocation)) {
      const { name, data } = invocation[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data: {
          cost: data.cost
        }
      });
    }
  }

  public async addSelectedSpells(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.selected.content')
    });

    const itemData = { name, type: Items.SELECTED, cost: 0 };

    await this.createOwnedItem(itemData);
  }

  public editSelectedSpells(selected: SelectedSpellsChange) {
    for (const id of Object.keys(selected)) {
      const { name, data } = selected[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data: {
          cost: data.cost
        }
      });
    }
  }

  public async addMaintentances(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.maintenances.content')
    });

    const itemData = { name, type: Items.MAINTENANCES, cost: 0 };

    await this.createOwnedItem(itemData);
  }

  public editMaintentances(maintentancesChanges: MaintenancesChanges) {
    for (const id of Object.keys(maintentancesChanges)) {
      const { name, data } = maintentancesChanges[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data: {
          cost: data.cost
        }
      });
    }
  }

  public async addFreeAccessSpellSlot(): Promise<void> {
    const name = await openDialog<string>({
      content: game.i18n.localize('dialogs.items.freeAccessSpell.content')
    });

    const itemData = { name, type: Items.FREE_ACCESS_SPELL, level: 0 };

    await this.createOwnedItem(itemData);
  }

  public editFreeAccessSpells(freeAccessSpellsChanges: FreeAccessSpellChange) {
    for (const id of Object.keys(freeAccessSpellsChanges)) {
      const { name, data } = freeAccessSpellsChanges[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data: {
          level: data.level
        }
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

    const itemData = { name, type: Items.METAMAGIC, grade: 0 };

    await this.createOwnedItem(itemData);
  }

  public editMetamagic(Metamagic: MetamagicChanges) {
    for (const id of Object.keys(Metamagic)) {
      const { name, data } = Metamagic[id];

      this.updateOwnedItem({
        _id: id,
        name,
        data: {
          grade: data.grade
        }
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
}
