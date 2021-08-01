import { SkillChange } from './SkillChange';
import { FreeAccessSpellChange } from './FreeAccessSpellChange';
import { SelectedSpellsChange } from './SelectedSpellsChange';
import { InvocationChanges } from './InvocationChange';
import { MetamagicChanges } from './MetamagicChange';
import { MaintenancesChanges } from './MaintenancesChange';
import { LevelChanges } from './LevelChange';
import { LanguageChanges } from './LanguageChange';
import { ElanPowerChanges } from './ElanPowerChanges';
import { ElanChanges } from './ElanChanges';

export type ItemChanges = {
  data: {
    dynamic: {
      skill: SkillChange;
      freeAccessSpells: FreeAccessSpellChange;
      maintenances: MaintenancesChanges;
      selected: SelectedSpellsChange;
      metamagic: MetamagicChanges;
      invocation: InvocationChanges;
      levels: LevelChanges;
      other_languages: LanguageChanges;
      elan_power: ElanPowerChanges;
      elan: ElanChanges;
    };
  };
};
