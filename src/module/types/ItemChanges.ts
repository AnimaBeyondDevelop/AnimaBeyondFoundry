import { SkillChange } from './SkillChange';
import { FreeAccessSpellChange } from './FreeAccessSpellChange';
import { MaintenancesChanges } from './maintenancesChange';
import { SelectedSpelsChange } from './SelectedSpelsChange';
import { InvocationChanges } from './InvocationChange';
import { MetamagicChanges } from './MetamagicChange';

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
