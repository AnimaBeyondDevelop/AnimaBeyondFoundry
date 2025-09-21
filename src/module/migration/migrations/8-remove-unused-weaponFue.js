import { Logger } from '../../../utils';

/** @typedef {import('./Migration').Migration} Migration

/** @type Migration */
export const Migration8RemoveWeaponFue = {
  id: 'migration_remove-unused-weapon-fue',
  version: '1.0.0',
  order: 1,
  title: 'Remove old, unused `weaponFue` from weapons',
  description:
    '`system.weaponFue` in weapons is no longer used, so this migration removes it.',
  filterItems(item) {
    return item.type === 'weapon';
  },
  filterActors(actor) {
    return actor.getWeapons().length !== 0;
  },
  async updateItem(item) {
    if (item.type !== 'weapon') {
      Logger.error('Weapon filter in migration not working');
      return;
    }
    await item.update({ 'system.-=weaponFue': null });
  }
};
