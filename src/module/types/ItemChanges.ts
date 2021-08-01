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
import { TitleChanges } from './TitleChange';
import { AdvantageChange } from './AdvantageChange';
import { DisadvantageChange } from './DisadvantageChange';
import { ContactChange } from './ContactChange';
import { NoteChange } from './NoteChange';

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
      titles: TitleChanges;
      advantages: AdvantageChange;
      disadvantages: DisadvantageChange;
      contacts: ContactChange;
      notes: NoteChange;
    };
  };
};
