/** @typedef {import('./Migration').Migration} Migration */

import { ABFItems } from '../../items/ABFItems.js';

/**
 * @param {{ value?: unknown } | undefined} area
 * @returns {boolean}
 */
function hasAreaValue(area) {
  const value = area?.value;
  if (value === undefined || value === null || value === '') return false;
  if (typeof value === 'number') return value !== 0;
  return String(value).trim() !== '' && String(value).trim() !== '0';
}

/**
 * @param {object} gradeOrEffect
 */
function ensureIsAreaField(gradeOrEffect) {
  if (!gradeOrEffect || typeof gradeOrEffect !== 'object') return;

  gradeOrEffect.area ??= { value: 0 };

  if (!gradeOrEffect.isArea) {
    gradeOrEffect.isArea = { value: hasAreaValue(gradeOrEffect.area) };
  } else if (gradeOrEffect.isArea.value === undefined) {
    gradeOrEffect.isArea.value = hasAreaValue(gradeOrEffect.area);
  }
}

/** @type Migration */
export const Migration16AddIsAreaFlag = {
  id: 'migration_add-is-area-flag',
  version: '2.2.4',
  order: 2,
  title: 'Add isArea checkbox to spells and psychic powers',
  description:
    'Adds <code>isArea</code> to spell grades and psychic power difficulties. ' +
    'If an existing area value is present, <code>isArea</code> is set to true so the field stays visible.',

  filterItems(item) {
    return item.type === ABFItems.SPELL || item.type === ABFItems.PSYCHIC_POWER;
  },

  filterActors(actor) {
    return (
      actor.items.filter(
        i => i.type === ABFItems.SPELL || i.type === ABFItems.PSYCHIC_POWER
      ).length > 0
    );
  },

  async updateItem(item) {
    if (item.type === ABFItems.SPELL) {
      const grades = item.system?.grades ?? {};
      for (const grade of Object.values(grades)) {
        ensureIsAreaField(grade);
      }
      return;
    }

    if (item.type === ABFItems.PSYCHIC_POWER) {
      const effects = item.system?.effects ?? {};
      for (const effect of Object.values(effects)) {
        ensureIsAreaField(effect);
      }
    }
  }
};
