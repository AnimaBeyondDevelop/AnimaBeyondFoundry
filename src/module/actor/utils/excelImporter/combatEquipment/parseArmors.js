/**
 * Parser de armaduras del Excel.
 *
 * IMPORTANTE: NO sobrescribimos `localization` al clonar del compendio.
 * El compendio ya viene con la localización correcta (head / breastplate /
 * nightdress / complete) y el sistema usa ese campo para distinguir
 * armaduras de cabeza vs cuerpo en mutateTotalArmor.js. Sobrescribirla con
 * el texto libre del Excel rompe la separación cabeza/cuerpo en la hoja.
 */
import { utils } from 'xlsx';
import {
  ARMOR_BLOCK_HEADER,
  ARMOR_BLOCK_END_HINTS,
  ARMOR_NAME_COL,
  ARMOR_LOCATION_COL,
  ARMOR_QUALITY_COL,
  ARMOR_MAX_SLOTS
} from './constants.js';
import { findInCompendium, cloneCompendiumItem } from './compendiumMatch.js';

function colLetterToIndex(letter) {
  let n = 0;
  for (const c of letter.toUpperCase()) n = n * 26 + (c.charCodeAt(0) - 64);
  return n - 1;
}

function cellValue(sheet, row, col) {
  const addr = utils.encode_cell({ r: row, c: col });
  const cell = sheet[addr];
  if (!cell) return null;
  return cell.v !== undefined ? cell.v : cell.w;
}

/**
 * Busca el header "Armadura" en la columna C de la hoja Combate y devuelve
 * la fila donde empiezan los datos. El bloque tiene una fila de cabeceras
 * (Nombre / Localización / Calidad / ...) y luego las filas de armaduras.
 */
function findArmorBlockStart(workbook) {
  const sheet = workbook.Sheets['Combate'];
  if (!sheet) return null;
  const nameCol = colLetterToIndex(ARMOR_NAME_COL);
  const locationCol = colLetterToIndex(ARMOR_LOCATION_COL);

  for (let row = 0; row < 40; row++) {
    const v = cellValue(sheet, row, nameCol);
    if (!v || String(v).trim() !== ARMOR_BLOCK_HEADER) continue;

    // Caso 1: la fila siguiente tiene "Localización"
    const nextRowLoc = cellValue(sheet, row + 1, locationCol);
    if (nextRowLoc && String(nextRowLoc).toLowerCase().includes('localiz')) {
      return { sheet, dataStartRow: row + 2 };
    }
    // Caso 2: misma fila tiene "Localización"
    const sameRowLoc = cellValue(sheet, row, locationCol);
    if (sameRowLoc && String(sameRowLoc).toLowerCase().includes('localiz')) {
      return { sheet, dataStartRow: row + 1 };
    }
  }
  return null;
}

function isEndOfBlock(text) {
  if (!text) return false;
  const t = String(text).trim();
  return ARMOR_BLOCK_END_HINTS.some(h => t.toLowerCase().startsWith(h.toLowerCase()));
}

export function readArmorsFromWorkbook(workbook) {
  const found = findArmorBlockStart(workbook);
  if (!found) {
    console.warn(`animabf | Header "${ARMOR_BLOCK_HEADER}" no encontrado en la hoja Combate.`);
    return null;
  }

  const { sheet, dataStartRow } = found;
  const nameCol = colLetterToIndex(ARMOR_NAME_COL);
  const locationCol = colLetterToIndex(ARMOR_LOCATION_COL);
  const qualityCol = colLetterToIndex(ARMOR_QUALITY_COL);

  const armors = [];
  for (let i = 0; i < ARMOR_MAX_SLOTS; i++) {
    const row = dataStartRow + i;
    const name = cellValue(sheet, row, nameCol);
    if (isEndOfBlock(name)) break;
    if (!name || String(name).trim() === '' || String(name).trim() === '0') continue;

    armors.push({
      slot: i + 1,
      name: String(name).trim(),
      location: cellValue(sheet, row, locationCol),
      quality: Number(cellValue(sheet, row, qualityCol)) || 0
    });
  }
  return armors;
}

export async function importArmorsToActor(actor, armors) {
  const items = [];
  const notFound = [];

  for (const a of armors) {
    const doc = await findInCompendium('armors', a.name);
    if (!doc) {
      notFound.push(a.name);
      items.push({
        name: a.name,
        type: 'armor',
        system: {
          quality: { value: a.quality },
          equipped: { value: true }
        },
        flags: {
          animabf: { excelImport: { unmatched: true, slot: a.slot } }
        }
      });
      continue;
    }

    // Solo sobrescribir quality + equipped. localization se respeta del compendio.
    const override = {
      equipped: { value: true },
      quality: { value: a.quality }
    };
    const itemData = cloneCompendiumItem(doc, override);
    itemData.flags = itemData.flags || {};
    itemData.flags.animabf = itemData.flags.animabf || {};
    itemData.flags.animabf.excelImport = {
      slot: a.slot,
      locationFromExcel: a.location ? String(a.location).trim() : null
    };
    items.push(itemData);
  }

  if (items.length) {
    await actor.createEmbeddedDocuments('Item', items);
  }
  return { imported: items.length, notFound };
}
