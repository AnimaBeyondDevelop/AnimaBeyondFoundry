/** @typedef {import('./Migration').Migration} Migration */

import { Logger } from '../../../utils';

const newItems = {
  get ready() {
    return !!this.psychicPower;
  },
  async init() {
    if (this.ready) return;
    // Compendio oficial de poderes psíquicos (equivalente a animabf.magic para conjuros)
    this.psychicPower = await game.packs.get('animabf.psychic').getDocuments();
  },
  async get(itemType, name) {
    if (!this.ready) await this.init();
    return this[itemType].find(i => i.name.toLowerCase() === name.toLowerCase());
  }
};

const parseDamage = text => {
  const m = (text ?? '').match(/Daño\s*(base)?\s*(\d+)/i);
  return m ? parseInt(m[2], 10) : 0;
};

const parseFatigue = text => {
  const m = (text ?? '').match(/Fatiga\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : 0;
};

const parseShieldPoints = text => {
  const effect = (text ?? '').replace('.', '');
  // "300 PV"
  const m1 = effect.match(/(\d+)\s*PV/i);
  if (m1) return parseInt(m1[1], 10) || 0;

  // por si hay textos tipo "puntos de resistencia"
  const m2 = effect.match(/(\d+)\s+puntos de resistencia/i);
  if (m2) return parseInt(m2[1], 10) || 0;

  return 0;
};

const parseAffectsInmaterial = text => {
  return /afecta a seres inmateriales/i.test(text ?? '');
};

const ensureEffectDefaults = effectData => {
  if (!effectData) return;

  effectData.value ??= '';
  effectData.damage ??= { value: 0 };
  effectData.fatigue ??= { value: 0 };
  effectData.shieldPoints ??= { value: 0 };
  effectData.affectsInmaterial ??= { value: false };
};

const migrateEffectStructuredFields = effectData => {
  ensureEffectDefaults(effectData);

  const text = effectData.value ?? '';

  const dmg = parseDamage(text);
  const fat = parseFatigue(text);
  const sp = parseShieldPoints(text);
  const inm = parseAffectsInmaterial(text);

  // Solo rellenamos si detectamos algo en el texto (para no pisar manuales)
  if (dmg > 0) effectData.damage.value = dmg;
  if (fat > 0) effectData.fatigue.value = fat;
  if (sp > 0) effectData.shieldPoints.value = sp;
  if (inm) effectData.affectsInmaterial.value = true;
};

/** @type Migration */
export const Migration11UpdatePsychicPowersStructuredData = {
  id: 'migration_update-psychic-powers-structured-data',
  version: '2.0.9',
  order: 2,
  title: 'Update psychic powers to use structured data',
  description:
    'Updates psychic powers to the new structured data format by copying the system data from the official compendium ' +
    '(animabf.psychic) while preserving custom description and effect texts. Ensures default structured fields exist ' +
    'per effect (damage, fatigue, shieldPoints, affectsInmaterial) and tries to parse them from effect text.',
  filterItems(item) {
    // Igual que con conjuros: no tocar compendio oficial
    return item.type === 'psychicPower' && !['animabf.psychic'].includes(item.pack);
  },
  filterActors(actor) {
    return actor.items.filter(i => i.type === 'psychicPower').length > 0;
  },
  async updateItem(item) {
    if (item.type !== 'psychicPower') {
      Logger.error('psychicPower filter not working');
      return;
    }

    const name = item.name.includes('-') ? item.name.split(' - ')[1] : item.name;
    const newItem = await newItems.get('psychicPower', name);
    if (!newItem) return;

    item.name = newItem.name;

    // Partimos del system del compendio (con la estructura nueva)
    const { system } = newItem;

    // Preservar descripción custom
    system.description.value = item.system.description?.value ?? system.description.value;

    // Preservar textos custom de efectos + asegurar defaults + parsear
    const keys = Object.keys(system.effects ?? {});
    for (const key of keys) {
      const src = item.system.effects?.[key];
      const dst = system.effects?.[key];
      if (!dst) continue;

      // preservar el texto (value)
      if (src?.value != null) {
        dst.value = src.value;
      }

      // defaults + parse a structured fields
      migrateEffectStructuredFields(dst);
    }

    item.system = system;
    return item;
  }
};
