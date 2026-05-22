/**
 * Constantes compartidas para la importación de equipo de combate desde el
 * Excel comunitario de Anima Beyond Fantasy.
 *
 * El anclaje principal son los Named Ranges definidos en la propia ficha
 * Excel: si la comunidad mueve filas/columnas, los named ranges se ajustan
 * solos. El parser sigue funcionando sin tocar código.
 */

// Named Range del Excel comunitario con la matriz de armas (17 filas x 10 armas).
export const WEAPON_TABLE_NAMED_RANGE = 'Tabla_Combate';

// Filas dentro de Tabla_Combate (1-based, relativo al rango).
export const WEAPON_ROW = {
  NAME: 1,
  QUALITY: 2,
  KNOWLEDGE: 3,
  SIZE: 4,
  AMMO: 5,
  AMMO_QUALITY: 6,
  CRITICS: 7,
  HANDS: 8,
  UNIQUE: 9,
  ASSOCIATED: 10,
  TURN_BASE: 11,
  TURN_FINAL: 12,
  ATTACK: 13,
  BLOCK: 14,
  DODGE: 15,
  STRENGTH: 16,
  DAMAGE: 17
};

// Para armaduras: anclaje semántico por texto literal "Armadura" en la
// columna C de la hoja "Combate". Si la comunidad cambia esa palabra, el
// Excel entero se rompe, no solo este parser.
export const ARMOR_BLOCK_HEADER = 'Armadura';
export const ARMOR_BLOCK_END_HINTS = ['Restricción Movimiento:', 'Pen. Natural:', 'Desarmado'];
export const ARMOR_NAME_COL = 'C';
export const ARMOR_LOCATION_COL = 'F';
export const ARMOR_QUALITY_COL = 'H';
// Slots máximos a leer bajo el header (el bloque del Excel tiene 6 filas).
export const ARMOR_MAX_SLOTS = 6;
