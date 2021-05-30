import { openDialog } from './utils/openDialog';
import { SkillChange } from './types/SkillChange';

export class ABFActor extends Actor {
  prepareData() {
    super.prepareData();

    const actorData = this.data;

    if (actorData.type === 'character') this._prepareCharacterData(actorData);
  }

  // eslint-disable-next-line class-methods-use-this
  _prepareCharacterData(actorData: any): void {
    const { data } = actorData;

    for (const char of Object.values(
      data.characteristics.primaries as Record<any, any>
    )) {
      if (char.value < 4) {
        char.mod = char.value * 10 - 40;
      }
      if (char.value >= 4) {
        char.mod =
          (Math.floor((char.value + 5) / 5) +
            Math.floor((char.value + 4) / 5) +
            Math.floor((char.value + 2) / 5) -
            4) *
          5;
      }
    }
  }

  async addFreeAccessSpellSlot(): Promise<void> {
    const name = await openDialog<string>({ name: 'Nombre del hechizo de acceso libre' });

    const itemData = { name, type: 'freeAccessSpell', level: Math.random() * 100 };

    await this.createOwnedItem(itemData);
  }

  async addSkillSlot(): Promise<void> {
    const name = await openDialog<string>({ name: 'Nombre de la habilidad' });

    const itemData = { name, type: 'skill', value: Math.random() * 100 };

    await this.createOwnedItem(itemData);
  }

  editSkills(skillChanges: SkillChange) {
    for (const id of Object.keys(skillChanges)) {
      this.updateOwnedItem({ _id: id, data: { value: skillChanges[id].data.value } });
    }
  }
}
