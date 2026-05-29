/**
 * Builders de workbooks xlsx en memoria para tests.
 *
 * Los parsers no leen ficheros físicos; reciben el objeto workbook que ya
 * devuelve `xlsx.read()`. Aquí construimos esa misma estructura desde cero
 * con `xlsx.utils`, lo que nos permite simular cualquier layout del Excel
 * comunitario (8.6.4, 8.7.0, hipotéticas 8.8.0, etc.) y verificar que los
 * anclajes del parser siguen funcionando.
 *
 * Cuando la comunidad publique una nueva versión del Excel:
 *   1. Si los tests pasan tras actualizar el WEAPON_ROW/etc. → simplemente
 *      ajustamos constantes y el código del parser sigue valiendo.
 *   2. Si los tests fallan con mensaje claro ("Named Range X no encontrado",
 *      "Header Armadura no encontrado") → sabemos exactamente qué retocar.
 */
import { utils } from 'xlsx';

/**
 * Construye un workbook con Named Range "Tabla_Combate" apuntando a un rango
 * configurable y poblado con datos de armas.
 *
 * @param {object} opts
 * @param {string} [opts.namedRangeName='Tabla_Combate']
 *   Cómo se llama el Named Range. Cambiar para simular una versión del Excel
 *   donde la comunidad lo renombró.
 * @param {string} [opts.sheetName='Combate'] Nombre de la hoja.
 * @param {{r: number, c: number}} [opts.topLeft={r: 29, c: 48}]
 *   Esquina superior-izquierda 0-based donde empieza el rango. El default
 *   (29, 48) equivale a AW30 (fila 30, col AW) del Excel comunitario.
 * @param {Array<object>} opts.weapons
 *   Array de objetos arma. Cada objeto representa una columna de Tabla_Combate.
 *   Campos: name, quality, knowledge, ammo, ammoQuality, hands.
 *   Pase {} para una columna vacía.
 */
export function buildWeaponsWorkbook({
  namedRangeName = 'Tabla_Combate',
  sheetName = 'Combate',
  topLeft = { r: 29, c: 48 }, // AW30
  weapons = []
} = {}) {
  // El layout dentro del rango es 17 filas. Definimos en qué fila relativa
  // (0-based) vive cada campo, replicando WEAPON_ROW del constants.js.
  const ROW_NAME = 0;
  const ROW_QUALITY = 1;
  const ROW_KNOWLEDGE = 2;
  const ROW_AMMO = 4;
  const ROW_AMMO_QUALITY = 5;
  const ROW_HANDS = 7;
  const TOTAL_ROWS = 17;

  // Crea un sheet vacío con valores en las celdas correctas.
  const sheet = {};
  // Limita el rango total del sheet al área que pintamos.
  const maxCol = topLeft.c + Math.max(0, weapons.length - 1);
  const maxRow = topLeft.r + TOTAL_ROWS - 1;

  weapons.forEach((w, i) => {
    const col = topLeft.c + i;
    const set = (row, value) => {
      if (value === undefined || value === null || value === '') return;
      const addr = utils.encode_cell({ r: row, c: col });
      sheet[addr] = { t: typeof value === 'number' ? 'n' : 's', v: value };
    };
    set(topLeft.r + ROW_NAME, w.name);
    set(topLeft.r + ROW_QUALITY, w.quality);
    set(topLeft.r + ROW_KNOWLEDGE, w.knowledge);
    set(topLeft.r + ROW_AMMO, w.ammo);
    set(topLeft.r + ROW_AMMO_QUALITY, w.ammoQuality);
    set(topLeft.r + ROW_HANDS, w.hands);
  });

  sheet['!ref'] = utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: maxRow, c: maxCol }
  });

  // Crea workbook con la hoja y el Named Range.
  const wb = {
    SheetNames: [sheetName],
    Sheets: { [sheetName]: sheet },
    Workbook: {
      Names: [
        {
          Name: namedRangeName,
          Ref: `'${sheetName}'!${utils.encode_range({
            s: topLeft,
            e: { r: maxRow, c: maxCol }
          }).replace(/([A-Z]+)(\d+)/g, '$$$1$$$2')}`
        }
      ]
    }
  };
  return wb;
}

/**
 * Construye un workbook con la hoja Combate conteniendo el bloque de Armadura.
 *
 * @param {object} opts
 * @param {string} [opts.sheetName='Combate']
 * @param {string} [opts.headerText='Armadura'] Texto literal del header.
 * @param {string} [opts.localizationText='Localización']
 *   Texto del header de la columna F adyacente. Si no contiene "localiz" (case
 *   insensitive) el parser no detecta el bloque.
 * @param {number} [opts.headerRow=10]
 *   Fila 0-based donde está el header "Armadura".
 * @param {string} [opts.headerCol='C']
 *   Letra de columna donde está el header (default C).
 * @param {boolean} [opts.localizationOnSameRow=false]
 *   Si true, "Localización" va en la misma fila que "Armadura" (variante 2
 *   del Excel). Si false, va en la fila siguiente (variante 1, default).
 * @param {Array<object>} opts.armors
 *   Array de armaduras. Cada una: { name, location, quality }.
 *   Pase undefined para indicar fila vacía o un texto del END_HINTS para marcar
 *   fin de bloque.
 */
export function buildArmorsWorkbook({
  sheetName = 'Combate',
  headerText = 'Armadura',
  localizationText = 'Localización',
  headerRow = 10,
  headerCol = 'C',
  localizationOnSameRow = false,
  armors = []
} = {}) {
  const colLetterToIdx = letter => {
    let n = 0;
    for (const c of letter.toUpperCase()) n = n * 26 + (c.charCodeAt(0) - 64);
    return n - 1;
  };

  const nameCol = colLetterToIdx(headerCol);
  const locationCol = colLetterToIdx('F');
  const qualityCol = colLetterToIdx('H');

  const sheet = {};
  const set = (r, c, value) => {
    if (value === undefined || value === null || value === '') return;
    const addr = utils.encode_cell({ r, c });
    sheet[addr] = { t: typeof value === 'number' ? 'n' : 's', v: value };
  };

  set(headerRow, nameCol, headerText);

  if (localizationOnSameRow) {
    set(headerRow, locationCol, localizationText);
  } else {
    set(headerRow + 1, locationCol, localizationText);
  }

  const dataStartRow = localizationOnSameRow ? headerRow + 1 : headerRow + 2;

  armors.forEach((a, i) => {
    const row = dataStartRow + i;
    set(row, nameCol, a.name);
    set(row, locationCol, a.location);
    set(row, qualityCol, a.quality);
  });

  const maxRow = dataStartRow + Math.max(0, armors.length - 1);
  sheet['!ref'] = utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: maxRow, c: qualityCol }
  });

  return {
    SheetNames: [sheetName],
    Sheets: { [sheetName]: sheet },
    Workbook: { Names: [] }
  };
}
