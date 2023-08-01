import { ALL_ITEM_CONFIGURATIONS } from './constants';

export const prepareItems = async actor => {
  for (const itemType in ALL_ITEM_CONFIGURATIONS) {
    if (ALL_ITEM_CONFIGURATIONS.hasOwnProperty(itemType)) {
      const config = ALL_ITEM_CONFIGURATIONS[itemType];
      await config.resetFieldPath?.(actor);
    }
  }

  // Prepare Actor's mystic items
  actor.system.mystic.spells = actor.getKnownSpells();
  actor.system.mystic.selectedSpells = actor.getSelectedSpells();
  actor.system.mystic.metamagics = actor.getKnownMetamagics();
  actor.system.mystic.spellMaintenances = actor.getSpellMaintenances();
  actor.system.mystic.summons = actor.getKnownSummonings();
};
