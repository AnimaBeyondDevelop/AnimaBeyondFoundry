import { SkillChange } from './SkillChange';
import { FreeAccessSpellChange } from './FreeAccessSpellChange';
import { SelectedSpelsChange } from './SelectedSpelsChange';
import { InvocationChanges } from './InvocationChange';
import { MetamagicChanges } from './MetamagicChange';
import { MaintenancesChanges } from './MaintenancesChange';

export type ItemChanges = {
  data: {
    dynamic: {
      skill: SkillChange;
      freeAccessSpells: FreeAccessSpellChange;
      maintenances: MaintenancesChanges;
      selected: SelectedSpelsChange;
      metamagic: MetamagicChanges;
      invocation: InvocationChanges;
    };
  };
};
