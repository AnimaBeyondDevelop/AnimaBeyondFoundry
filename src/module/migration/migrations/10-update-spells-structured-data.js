/** @typedef {import('./Migration').Migration} Migration */

import { Logger } from '../../../utils';

const newItems = {
  get ready() {
    return !!this.spell;
  },
  async init() {
    if (this.ready) return;
    this.spell = await game.packs.get('animabf.magic').getDocuments();
  },
  async get(itemType, name) {
    if (!this.ready) await this.init();
    return this[itemType].find(i => i.name.toLowerCase() === name.toLowerCase());
  }
};

/** @type Migration */
export const Migration10UpdateSpellsStructuredData = {
  id: 'migration_update-spells-structured-data',
  version: '2.0.6',
  order: 1,
  title: 'Update spells to use structured damage and resistance data',
  description:
    'This migration updates existing spells to include structured fields for damage, area of effect, ' +
    'and resistance bonuses instead of relying on text parsing. This improves performance and ' +
    'makes spell data more reliable and easier to work with. ' +
    'Custom spell descriptions will be preserved. Custom spells will be left unchanged but may need ' +
    'manual updates to benefit from the new structured data format.',
  filterItems(item) {
    return item.type === 'spell' && !['animabf.magic'].includes(item.pack);
  },
  filterActors(actor) {
    return actor.items.filter(i => i.type === 'spell').length > 0;
  },
  async updateItem(item) {
    if (item.type !== 'spell') {
      Logger.error('spell filter not working');
      return;
    }

    const name = item.name.includes('-') ? item.name.split(' - ')[1] : item.name;
    const newItem = await newItems.get('spell', name);
    if (!newItem) return;

    item.name = newItem.name;
    const { system } = newItem;
    system.description.value = item.system.description.value;

    for (const gradeName of ['base', 'intermediate', 'advanced', 'arcane']) {
      if (item.system.grades?.[gradeName]?.description?.value) {
        system.grades[gradeName].description.value = item.system.grades[gradeName].description.value;
      }
    }

    item.system = system;
    return item;
  }
};
