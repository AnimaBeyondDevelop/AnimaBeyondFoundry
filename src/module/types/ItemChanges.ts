import { SkillChange } from './SkillChange';
import { FreeAccessSpellChange } from './FreeAccessSpellChange';
import { MaintenancesChanges } from './maintenancesChange';
import { SelectedSpelsChange } from './SelectedSpelsChange';

export type ItemChanges = {
  data: {
    dynamic: {
      skill: SkillChange;
      freeAccessSpells: FreeAccessSpellChange;
      maintenances: MaintenancesChanges;
      selected: SelectedSpelsChange;
    };
  };
};
