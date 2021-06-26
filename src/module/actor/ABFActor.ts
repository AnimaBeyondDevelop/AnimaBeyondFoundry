import { openDialog } from '../utils/openDialog';
import { SkillChange } from '../types/SkillChange';
import { FreeAccessSpellChange } from '../types/FreeAccessSpellChange';
import { prepareActor } from "./utils/prepareActor/prepareActor";

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
      content: 'Nombre del hechizo de acceso libre'
    });

    const itemData = { name, type: 'freeAccessSpell', level: 0 };

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
    const name = await openDialog<string>({ content: 'Nombre de la habilidad' });

    const itemData = { name, type: 'skill', value: 0 };

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
