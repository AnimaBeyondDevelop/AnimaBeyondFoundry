import { openDialog } from '../utils/openDialog';
import { SkillChange } from '../types/SkillChange';
import { FreeAccessSpellChange } from '../types/FreeAccessSpellChange';
import { MaintenancesChanges } from '../types/maintenancesChange';
import { SelectedSpelsChange } from '../types/SelectedSpelsChange';

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

  public async addSelectedSpells(): Promise<void> {
    const name = await openDialog<string>({ name: 'Nombre del nuevo hechizo seleccionado' });

    const itemData = { name, type: 'selected', cost: 0 };

    await this.createOwnedItem(itemData);
  }

  public editSelectedSpells(selected: SelectedSpelsChange) {
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
    const name = await openDialog<string>({ name: 'Nombre del nuevo mantenimiento' });

    const itemData = { name, type: 'maintenances', cost: 0 };

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
    const name = await openDialog<string>({ name: 'Nombre del hechizo de acceso libre' });

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
    const name = await openDialog<string>({ name: 'Nombre de la habilidad' });

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
