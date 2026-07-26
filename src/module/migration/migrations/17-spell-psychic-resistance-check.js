/** @typedef {import('./Migration').Migration} Migration */

import { ABFItems } from '../../items/ABFItems.js';
import { ensureResistanceCheck } from '../../types/common/resistanceCheck.js';

/**
 * @param {object | undefined} gradeOrEffect
 */
function ensureFixedResistanceEffect(gradeOrEffect) {
  if (!gradeOrEffect || typeof gradeOrEffect !== 'object') return;
  gradeOrEffect.resistanceEffect = ensureResistanceCheck(gradeOrEffect.resistanceEffect, {
    scalable: false
  });
}

/** @type Migration */
export const Migration20SpellPsychicResistanceCheck = {
  id: 'migration_spell-psychic-resistance-check',
  version: '2.2.4',
  order: 6,
  title: 'Add full resistance check to spells and psychic powers',
  description:
    'Upgrades spell grade <code>resistanceEffect</code> and adds the same fixed ' +
    '(non-scaling) structure to psychic power difficulties: types, highest/lowest, ' +
    'on-hit/automatic application and Frialdad flag.',

  filterItems(item) {
    return item.type === ABFItems.SPELL || item.type === ABFItems.PSYCHIC_POWER;
  },

  async updateItem(item) {
    if (item.type === ABFItems.SPELL) {
      const grades = item.system?.grades ?? {};
      for (const grade of Object.values(grades)) {
        ensureFixedResistanceEffect(grade);
      }
      return;
    }

    if (item.type === ABFItems.PSYCHIC_POWER) {
      const effects = item.system?.effects ?? {};
      for (const effect of Object.values(effects)) {
        ensureFixedResistanceEffect(effect);
      }
    }
  }
};
