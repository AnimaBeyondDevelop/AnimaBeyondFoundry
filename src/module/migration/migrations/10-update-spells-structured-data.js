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

const ensureGradeDefaults = gradeData => {
  if (!gradeData) return;

  gradeData.damage ??= { value: 0 };
  gradeData.area ??= { value: 0 };
  gradeData.resistanceEffect ??= { value: 0, type: null };
  gradeData.shieldPoints ??= { value: 0 };
};

/** @type Migration */
export const Migration10UpdateSpellsStructuredData = {
  id: 'migration_update-spells-structured-data',
  version: '2.0.9',
  order: 1,
  title: 'Update spells to use structured data',
  description:
    'Updates spells to the new structured data format by copying the system data from the official compendium ' +
    '(animabf.magic) while preserving custom descriptions. Ensures default structured fields exist (damage, area, ' +
    'resistanceEffect, shieldPoints).',
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

    // Start from the compendium system (already structured)
    const { system } = newItem;

    // Preserve base description
    system.description.value = item.system.description.value;

    // Preserve per-grade custom descriptions + ensure defaults
    for (const gradeName of ['base', 'intermediate', 'advanced', 'arcane']) {
      const srcGrade = item.system.grades?.[gradeName];
      const dstGrade = system.grades?.[gradeName];
      if (!dstGrade) continue;

      if (srcGrade?.description?.value) {
        dstGrade.description.value = srcGrade.description.value;
      }

      ensureGradeDefaults(dstGrade);
    }

    item.system = system;
    return item;
  }
};
