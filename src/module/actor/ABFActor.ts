import { openDialog } from '../utils/openDialog';
import { SkillChange } from '../types/SkillChange';
import { FreeAccessSpellChange } from '../types/FreeAccessSpellChange';
import { prepareActor } from './utils/prepareActor/prepareActor';
import { Items } from './utils/prepareSheet/prepareItems/Items';

export class ABFActor extends Actor {
  prepareData() {
    super.prepareData();

    const actorData = this.data;

    if (actorData.type === 'character') {
      this.data = prepareActor(actorData);
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
}
