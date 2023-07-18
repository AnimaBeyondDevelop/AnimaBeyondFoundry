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

  actor.system.combat.weapons = actor.getWeapons().map(weapon => {
    if (
      weapon.system.isRanged &&
      typeof weapon.system.ammoId === 'string' &&
      !!weapon.system.ammoId
    ) {
      const ammo = actor.system.combat.ammo;

      weapon.system.ammo = ammo.find(i => i._id === weapon.system.ammoId);
    }
    return weapon;
  });

  // Prepare Actor's domine items
  actor.system.domine.arsMagnus = actor.getArsMagnus();
  actor.system.domine.creatures = actor.getKnownCreatures();
  actor.system.domine.kiSkills = actor.getKiSkills();
  actor.system.domine.nemesisSkills = actor.getNemesisSkills();
  actor.system.domine.martialArts = actor.getMartialArts();
  actor.system.domine.specialSkills = actor.getSpecialSkills();

  // Prepare Actor's general items
  actor.system.general.advantages = actor.getAdvantages();
  actor.system.general.contacts = actor.getContacts();

  // Prepare Actor's mystic items
  actor.system.mystic.spells = actor.getKnownSpells();
  actor.system.mystic.selectedSpells = actor.getSelectedSpells();
  actor.system.mystic.metamagics = actor.getKnownMetamagics();
  actor.system.mystic.spellMaintenances = actor.getSpellMaintenances();
  actor.system.mystic.summons = actor.getKnownSummonings();
};
