import { SkillChange } from './SkillChange';
import { FreeAccessSpellChange } from './FreeAccessSpellChange';
import { SelectedSpellsChange } from './SelectedSpellsChange';
import { SummonChanges } from './SummonChange';
import { MetamagicChanges } from './MetamagicChange';
import { SpellMaintenancesChanges } from './SpellMaintenancesChange';
import { LevelChanges } from './LevelChange';
import { LanguageChanges } from './LanguageChange';
import { ElanPowerChanges } from './ElanPowerChanges';
import { ElanChanges } from './ElanChanges';
import { TitleChanges } from './TitleChange';
import { AdvantageChange } from './AdvantageChange';
import { DisadvantageChange } from './DisadvantageChange';
import { ContactChange } from './ContactChange';
import { NoteChange } from './NoteChange';
import { PsychicDisciplineChanges } from './PsychicDisciplineChanges';
import { MentalPatternChanges } from './MentalPatternChanges';
import { InnatePsychicPowerChanges } from './InnatePsychicPowerChanges';

export type ItemChanges = {
  data: {
    dynamic: {
      skill: SkillChange;
      freeAccessSpells: FreeAccessSpellChange;
      spellMaintenances: SpellMaintenancesChanges;
      selectedSpells: SelectedSpellsChange;
      metamagics: MetamagicChanges;
      summons: SummonChanges;
      levels: LevelChanges;
      other_languages: LanguageChanges;
      elan_power: ElanPowerChanges;
      elan: ElanChanges;
      titles: TitleChanges;
      advantages: AdvantageChange;
      disadvantages: DisadvantageChange;
      contacts: ContactChange;
      notes: NoteChange;
      psychicDisciplines: PsychicDisciplineChanges;
      mentalPatterns: MentalPatternChanges;
      innatePsychicPowers: InnatePsychicPowerChanges;
    };
  };
};
