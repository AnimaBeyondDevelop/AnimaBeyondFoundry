import { AdvantageItemConfig } from '../../../types/general/AdvantageItemConfig';
import { ArsMagnusItemConfig } from '../../../types/domine/ArsMagnusItemConfig';
import { CombatSpecialSkillItemConfig } from '../../../types/combat/CombatSpecialSkillItemConfig';
import { CombatTableItemConfig } from '../../../types/combat/CombatTableItemConfig';
import { ContactItemConfig } from '../../../types/general/ContactItemConfig';
import { CreatureItemConfig } from '../../../types/domine/CreatureItemConfig';
import { DisadvantageItemConfig } from '../../../types/general/DisadvantageItemConfig';
import { SpellItemConfig } from '../../../types/mystic/SpellItemConfig';
import { ElanItemConfig } from '../../../types/general/ElanItemConfig';
import { InnatePsychicPowerItemConfig } from '../../../types/psychic/InnatePsychicPowerItemConfig';
import { KiSkillItemConfig } from '../../../types/domine/KiSkillItemConfig';
import { LanguageItemConfig } from '../../../types/general/LanguageItemConfig';
import { LevelItemConfig } from '../../../types/general/LevelItemConfig';
import { MartialArtItemConfig } from '../../../types/domine/MartialArtItemConfig';
import { MentalPatternItemConfig } from '../../../types/psychic/MentalPatternItemConfig';
import { MetamagicItemConfig } from '../../../types/mystic/MetamagicItemConfig';
import { NemesisSkillItemConfig } from '../../../types/domine/NemesisSkillItemConfig';
import { NoteItemConfig } from '../../../types/general/NoteItemConfig';
import { PsychicDisciplineItemConfig } from '../../../types/psychic/PsychicDisciplineItemConfig';
import { PsychicPowerItemConfig } from '../../../types/psychic/PsychicPowerItemConfig';
import { SecondarySpecialSkillItemConfig } from '../../../types/secondaries/SecondarySpecialSkillItemConfig';
import { SelectedSpellItemConfig } from '../../../types/mystic/SelectedSpellItemConfig';
import { SpecialSkillItemConfig } from '../../../types/domine/SpecialSkillItemConfig';
import { SpellMaintenanceItemConfig } from '../../../types/mystic/SpellMaintenanceItemConfig';
import { SummonItemConfig } from '../../../types/mystic/SummonItemConfig';
import { TechniqueItemConfig } from '../../../types/domine/TechniqueItemConfig';
import { TitleItemConfig } from '../../../types/general/TitleItemConfig';
import { WeaponItemConfig } from '../../../types/combat/WeaponItemConfig';
import { AmmoItemConfig } from '../../../types/combat/AmmoItemConfig';
import { ElanPowerItemConfig } from '../../../types/general/ElanPowerItemConfig';
import { ArmorItemConfig } from '../../../types/combat/ArmorItemConfig';
import { InventoryItemItemConfig } from '../../../types/general/InventoryItemItemConfig';

export const INTERNAL_ITEM_CONFIGURATIONS = {
  [ArsMagnusItemConfig.type]: ArsMagnusItemConfig,
  [CombatSpecialSkillItemConfig.type]: CombatSpecialSkillItemConfig,
  [CombatTableItemConfig.type]: CombatTableItemConfig,
  [ContactItemConfig.type]: ContactItemConfig,
  [CreatureItemConfig.type]: CreatureItemConfig,
  [ElanItemConfig.type]: ElanItemConfig,
  [ElanPowerItemConfig.type]: ElanPowerItemConfig,
  [InnatePsychicPowerItemConfig.type]: InnatePsychicPowerItemConfig,
  [KiSkillItemConfig.type]: KiSkillItemConfig,
  [LanguageItemConfig.type]: LanguageItemConfig,
  [LevelItemConfig.type]: LevelItemConfig,
  [MartialArtItemConfig.type]: MartialArtItemConfig,
  [MetamagicItemConfig.type]: MetamagicItemConfig,
  [NemesisSkillItemConfig.type]: NemesisSkillItemConfig,
  [SecondarySpecialSkillItemConfig.type]: SecondarySpecialSkillItemConfig,
  [SelectedSpellItemConfig.type]: SelectedSpellItemConfig,
  [SpecialSkillItemConfig.type]: SpecialSkillItemConfig,
  [SpellMaintenanceItemConfig.type]: SpellMaintenanceItemConfig,
  [SummonItemConfig.type]: SummonItemConfig,
  [TitleItemConfig.type]: TitleItemConfig,
  [InventoryItemItemConfig.type]: InventoryItemItemConfig
};

export const ITEM_CONFIGURATIONS = {
  [AmmoItemConfig.type]: AmmoItemConfig,
  [AdvantageItemConfig.type]: AdvantageItemConfig,
  [ArmorItemConfig.type]: ArmorItemConfig,
  [DisadvantageItemConfig.type]: DisadvantageItemConfig,
  [SpellItemConfig.type]: SpellItemConfig,
  [MentalPatternItemConfig.type]: MentalPatternItemConfig,
  [NoteItemConfig.type]: NoteItemConfig,
  [PsychicDisciplineItemConfig.type]: PsychicDisciplineItemConfig,
  [PsychicPowerItemConfig.type]: PsychicPowerItemConfig,
  [TechniqueItemConfig.type]: TechniqueItemConfig,
  [WeaponItemConfig.type]: WeaponItemConfig
};

export const ALL_ITEM_CONFIGURATIONS = {
  ...ITEM_CONFIGURATIONS,
  ...INTERNAL_ITEM_CONFIGURATIONS
};
