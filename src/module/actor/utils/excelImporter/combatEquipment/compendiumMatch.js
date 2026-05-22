/**
 * Helpers para buscar items por nombre en los compendios del sistema animabf.
 *
 * El pack 'weapons' mezcla armas (type='weapon') y munición (type='ammo').
 * Cargamos cada tipo lógico filtrando por el tipo real del item.
 *
 * Para añadir un alias nuevo (sinónimos entre Excel comunitario y compendio
 * del sistema):
 *   1. Ver en la consola de Foundry el warning "Sin match para ...".
 *   2. Comprobar el nombre real en el compendio del sistema.
 *   3. Añadir la entrada normalizada (minúsculas, sin tildes) a ALIASES.
 */

const SYSTEM_ID = 'animabf';

/**
 * Alias Excel → compendio. Claves y valores normalizados.
 * Específicos por tipo lógico para evitar colisiones entre armas/armaduras/munición.
 */
const ALIASES = {
  weapons: {
    'espada a dos manos': 'mandoble'
  },
  armors: {},
  ammo: {}
};

// Cache por tipo lógico. Se invalida solo al recargar Foundry.
const cache = {
  weapons: null,
  armors: null,
  ammo: null
};

/**
 * Limpia el cache. Pensado para tests; sin uso en producción.
 */
export function _clearCache() {
  Object.keys(cache).forEach(k => {
    cache[k] = null;
  });
}

// Tipo lógico → { pack del compendio, tipo real del item }.
const SOURCE_MAP = {
  weapons: { pack: 'weapons', itemType: 'weapon' },
  armors: { pack: 'armors', itemType: 'armor' },
  ammo: { pack: 'weapons', itemType: 'ammo' }
};

async function loadPack(logicalType) {
  if (cache[logicalType]) return cache[logicalType];

  const cfg = SOURCE_MAP[logicalType];
  if (!cfg) {
    console.warn(`animabf | Tipo lógico desconocido para compendio: ${logicalType}`);
    cache[logicalType] = [];
    return [];
  }

  const packKey = `${SYSTEM_ID}.${cfg.pack}`;
  const pack = game.packs.get(packKey);
  if (!pack) {
    console.warn(`animabf | Pack no encontrado: ${packKey}`);
    cache[logicalType] = [];
    return [];
  }

  const all = await pack.getDocuments();
  cache[logicalType] = all.filter(d => d.type === cfg.itemType);
  return cache[logicalType];
}

function normalize(s) {
  if (!s) return '';
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Busca un item del compendio por nombre.
 *
 * Estrategia (en orden):
 *   1. Match exacto (case-insensitive, sin tildes).
 *   2. Alias directo (tabla ALIASES por tipo).
 *   3. Quitar 's' final del input ("Saetas" → "saeta").
 *   4. Quitar 'es' final del input ("Patrones" → "patron").
 *   5. Añadir 's' al input por si el compendio está en plural.
 *
 * @param {'weapons'|'armors'|'ammo'} logicalType
 * @param {string} name
 * @returns {Promise<Document|null>}
 */
export async function findInCompendium(logicalType, name) {
  if (!name) return null;
  const docs = await loadPack(logicalType);
  const target = normalize(name);
  const aliasTable = ALIASES[logicalType] || {};

  let hit = docs.find(d => normalize(d.name) === target);
  if (hit) return hit;

  if (aliasTable[target]) {
    hit = docs.find(d => normalize(d.name) === aliasTable[target]);
    if (hit) return hit;
  }

  if (target.endsWith('s')) {
    const singular = target.slice(0, -1);
    hit = docs.find(d => normalize(d.name) === singular);
    if (hit) return hit;
    if (aliasTable[singular]) {
      hit = docs.find(d => normalize(d.name) === aliasTable[singular]);
      if (hit) return hit;
    }
  }

  if (target.endsWith('es')) {
    const stem = target.slice(0, -2);
    hit = docs.find(d => normalize(d.name) === stem);
    if (hit) return hit;
    if (aliasTable[stem]) {
      hit = docs.find(d => normalize(d.name) === aliasTable[stem]);
      if (hit) return hit;
    }
  }

  hit = docs.find(d => normalize(d.name) === `${target}s`);
  if (hit) return hit;

  return null;
}

/**
 * Clona un item del compendio aplicando overrides al system.
 * Elimina _id y ownership para que se cree como item embebido nuevo.
 */
export function cloneCompendiumItem(doc, overrideSystem = {}) {
  const obj = doc.toObject();
  delete obj._id;
  delete obj.ownership;
  obj.system = foundry.utils.mergeObject(obj.system ?? {}, overrideSystem, { inplace: false });
  return obj;
}
