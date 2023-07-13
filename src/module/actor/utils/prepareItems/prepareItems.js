import { ALL_ITEM_CONFIGURATIONS } from './constants';

export const prepareItems = async actor => {
  const items = actor.getAllItems();

  for (const item of items) {
    const configuration = ALL_ITEM_CONFIGURATIONS[item.type];

    if (configuration) {
      await configuration.onAttach?.(actor, item);

      configuration.prepareItem?.(item);
    } else {
      console.warn(`Item with ${item.type} unrecognized. Skipping...`, { item });
    }
  }

  // Prepare Actor's combat items
  actor.system.combat.ammo = actor.getAmmos();
  actor.system.combat.armors = actor.getArmors();
  actor.system.combat.combatSpecialSkills = actor.getCombatSpecialSkills();
  actor.system.combat.combatTables = actor.getCombatTables();
  // Prepare Actor's mystic items
  actor.system.mystic.spells = actor.getKnownSpells();
  actor.system.mystic.selectedSpells = actor.getSelectedSpells();
  actor.system.mystic.metamagics = actor.getKnownMetamagics();
  actor.system.mystic.spellMaintenances = actor.getSpellMaintenances();
  actor.system.mystic.summons = actor.getKnownSummonings();
};
