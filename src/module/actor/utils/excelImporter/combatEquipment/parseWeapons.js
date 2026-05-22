/**
 * Parser de armas del Excel.
 *
 * Lee el Named Range "Tabla_Combate" del Excel comunitario, que apunta a una
 * matriz 17 filas x 10 armas. Si el Excel cambia el layout pero conserva el
 * named range, este parser sigue funcionando sin cambios.
 */
import { utils } from 'xlsx';
import {
  WEAPON_TABLE_NAMED_RANGE,
  WEAPON_ROW
} from './constants.js';
import { findInCompendium, cloneCompendiumItem } from './compendiumMatch.js';

/**
 * Resuelve el rango "Tabla_Combate" en el workbook xlsx.
 * @returns {{ sheet: object, range: object, sheetName: string }|null}
 */
function resolveTablaCombate(workbook) {
  try {
    const names = workbook?.Workbook?.Names ?? [];
    const target = names.find(n => (n.Name || n.name) === WEAPON_TABLE_NAMED_RANGE);
    if (!target) return null;

    // Formato típico: "'Combate'!$AW$30:$BF$46"
    const ref = target.Ref || target.ref || '';
    const match = ref.match(/^'?([^'!]+)'?!(.+)$/);
    if (!match) return null;

    const sheetName = match[1];
    const a1Range = match[2].replace(/\$/g, '');
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return null;

    return { sheet, range: utils.decode_range(a1Range), sheetName };
  } catch (err) {
    console.warn('animabf | error resolviendo Tabla_Combate:', err);
    return null;
  }
}

function cellValue(sheet, row, col) {
  const addr = utils.encode_cell({ r: row, c: col });
  const cell = sheet[addr];
  if (!cell) return null;
  return cell.v !== undefined ? cell.v : cell.w;
}

/**
 * El Excel guarda el modo de empuñadura como string libre. Lo mapeamos a uno
 * de los valores que espera el sistema animabf.
 */
function mapHandsType(text) {
  if (!text) return null;
  const t = String(text).toLowerCase();
  if (t.includes('1 o 2') || t.includes('una o dos')) return 'one_or_two_hands';
  if (t.includes('dos manos') || t.includes('a dos')) return 'two_hands';
  if (t.includes('una mano') || t.includes('a una')) return 'one_hand';
  return null;
}

function mapKnowledgeType(text) {
  if (!text) return 'known';
  const t = String(text).toLowerCase();
  if (t.startsWith('similar')) return 'similar';
  if (t.startsWith('mixta')) return 'mixed';
  if (t.startsWith('distinta')) return 'different';
  return 'known';
}

/**
 * Lee la Tabla_Combate del workbook y devuelve un array de objetos con
 * los datos crudos de las armas que tengan nombre no vacío.
 *
 * @param {object} workbook
 * @returns {Array<object>|null} null si el named range no existe.
 */
export function readWeaponsFromWorkbook(workbook) {
  const resolved = resolveTablaCombate(workbook);
  if (!resolved) {
    console.warn(`animabf | Named range ${WEAPON_TABLE_NAMED_RANGE} no encontrado.`);
    return null;
  }

  const { sheet, range } = resolved;
  const startRow = range.s.r;
  const startCol = range.s.c;
  const numCols = range.e.c - range.s.c + 1;

  const weapons = [];
  for (let i = 0; i < numCols; i++) {
    const col = startCol + i;
    const name = cellValue(sheet, startRow + WEAPON_ROW.NAME - 1, col);
    if (!name || String(name).trim() === '' || String(name).trim() === '-') continue;

    const quality = cellValue(sheet, startRow + WEAPON_ROW.QUALITY - 1, col);
    const knowledge = cellValue(sheet, startRow + WEAPON_ROW.KNOWLEDGE - 1, col);
    const ammo = cellValue(sheet, startRow + WEAPON_ROW.AMMO - 1, col);
    const ammoQuality = cellValue(sheet, startRow + WEAPON_ROW.AMMO_QUALITY - 1, col);
    const hands = cellValue(sheet, startRow + WEAPON_ROW.HANDS - 1, col);

    weapons.push({
      slot: i + 1,
      name: String(name).trim(),
      quality: Number(quality) || 0,
      knowledge: mapKnowledgeType(knowledge),
      ammo: ammo && ammo !== '-' && ammo !== 0 ? String(ammo).trim() : null,
      ammoQuality: Number(ammoQuality) || 0,
      hands: mapHandsType(hands)
    });
  }
  return weapons;
}

/**
 * Crea items de tipo 'weapon' embebidos en el actor, vinculados al compendio
 * cuando hay match. Sin match: crea un item suelto con los datos del Excel
 * y lo marca con flags.animabf.excelImport.unmatched.
 *
 * @param {Actor} actor
 * @param {Array<object>} weapons  Salida de readWeaponsFromWorkbook.
 * @param {Object<string, string>} [ammoIdMap={}]
 *   Mapa { nombreAmmoExcel: _id del item de munición ya creado en el actor }.
 *   Permite enlazar arma → munición vía `system.ammoId` (el campo que usa
 *   el sistema para resolver la munición asociada al disparar).
 *   Si el arma no tiene ammo o la ammo no está en el mapa, no se enlaza.
 *
 * @returns {{ imported: number, notFound: string[] }}
 */
export async function importWeaponsToActor(actor, weapons, ammoIdMap = {}) {
  const items = [];
  const notFound = [];

  for (const w of weapons) {
    const ammoId = w.ammo && ammoIdMap[w.ammo] ? ammoIdMap[w.ammo] : null;
    const doc = await findInCompendium('weapons', w.name);

    if (!doc) {
      notFound.push(w.name);
      const fallback = {
        name: w.name,
        type: 'weapon',
        system: {
          quality: { value: w.quality },
          equipped: { value: true }
        },
        flags: {
          animabf: { excelImport: { unmatched: true, slot: w.slot } }
        }
      };
      if (ammoId) fallback.system.ammoId = ammoId;
      items.push(fallback);
      continue;
    }

    const override = {
      equipped: { value: true },
      quality: { value: w.quality },
      isKnownType: { value: w.knowledge }
    };
    if (ammoId) override.ammoId = ammoId;
    // Si el arma del compendio admite ambos modos y el Excel especifica uno,
    // aplicamos el específico al actor.
    if (w.hands === 'two_hands' || w.hands === 'one_hand') {
      override.equippedHand = {
        value: w.hands === 'two_hands' ? 'two-handed' : 'one-handed'
      };
    }

    const itemData = cloneCompendiumItem(doc, override);
    itemData.flags = itemData.flags || {};
    itemData.flags.animabf = itemData.flags.animabf || {};
    itemData.flags.animabf.excelImport = { slot: w.slot };
    items.push(itemData);
  }

  if (items.length) {
    await actor.createEmbeddedDocuments('Item', items);
  }
  return { imported: items.length, notFound };
}
