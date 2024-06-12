/** @typedef {import('./Migration').Migration} Migration

/** @type Migration */
export const Migration8RemoveWeaponFue = {
  version: 8,
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
      console.error('AnimaBF | weapon filter in migration not working');
      return;
    }
    await item.update({ 'system.-=weaponFue': null });
  }
};
