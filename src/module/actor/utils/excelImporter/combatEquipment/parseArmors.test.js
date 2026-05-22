/**
 * Tests "Excel-resistant" para parseArmors.
 *
 * Ataca los anclajes del Excel comunitario para el bloque de armadura:
 *
 *   - Hoja literal "Combate".
 *   - Header literal "Armadura" en columna C.
 *   - Header "Localización" adyacente (misma fila o siguiente).
 *   - End-of-block: "Restricción Movimiento:", "Pen. Natural:", "Desarmado".
 *   - Columnas F (location) y H (quality) de los datos.
 *
 * Si una nueva versión del Excel rompe alguno, el test falla con mensaje
 * concreto.
 */
import { readArmorsFromWorkbook } from './parseArmors.js';
import { buildArmorsWorkbook } from './__fixtures__/buildWorkbook.js';

describe('readArmorsFromWorkbook', () => {
  it('returns null when the Combate sheet is missing', () => {
    const wb = buildArmorsWorkbook({ sheetName: 'OtraHoja', armors: [] });
    expect(readArmorsFromWorkbook(wb)).toBeNull();
  });

  it('returns null when the Armadura header is missing', () => {
    const wb = buildArmorsWorkbook({ headerText: 'NoArmadura', armors: [] });
    expect(readArmorsFromWorkbook(wb)).toBeNull();
  });

  it('returns null when the Localización adjacent text is missing', () => {
    // Sin la marca "Localiz..." adyacente no podemos diferenciar el bloque
    // de armadura del de Tabla de Combate u otras menciones de "Armadura".
    const wb = buildArmorsWorkbook({ localizationText: 'Algo', armors: [] });
    expect(readArmorsFromWorkbook(wb)).toBeNull();
  });

  it('reads armors when Localización is on the row below (variant 1)', () => {
    const wb = buildArmorsWorkbook({
      localizationOnSameRow: false,
      armors: [
        { name: 'Segmentada', location: 'Cuerpo', quality: 5 },
        { name: 'Coronilla', location: 'Cabeza', quality: 0 }
      ]
    });
    const result = readArmorsFromWorkbook(wb);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Segmentada');
    expect(result[0].location).toBe('Cuerpo');
    expect(result[0].quality).toBe(5);
  });

  it('reads armors when Localización is on the same row (variant 2)', () => {
    // Algunas versiones del Excel meten "Armadura" y "Localización" en la
    // misma fila. El parser tiene que soportar ambos layouts.
    const wb = buildArmorsWorkbook({
      localizationOnSameRow: true,
      armors: [
        { name: 'Cuero endurecido', location: 'Cuerpo', quality: 0 }
      ]
    });
    const result = readArmorsFromWorkbook(wb);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Cuero endurecido');
  });

  it('stops at end-of-block markers', () => {
    const wb = buildArmorsWorkbook({
      armors: [
        { name: 'Coronilla', location: 'Cabeza', quality: 0 },
        { name: 'Restricción Movimiento:' }, // marcador de fin
        { name: 'Armadura fantasma', location: 'Cuerpo', quality: 0 } // no debe leerse
      ]
    });
    const result = readArmorsFromWorkbook(wb);
    expect(result.map(a => a.name)).toEqual(['Coronilla']);
  });

  it('skips empty rows and "0" placeholders without stopping the block', () => {
    const wb = buildArmorsWorkbook({
      armors: [
        { name: 'Segmentada', location: 'Cuerpo', quality: 5 },
        { name: '0' }, // placeholder vacío del Excel
        { name: 'Coronilla', location: 'Cabeza', quality: 0 }
      ]
    });
    const result = readArmorsFromWorkbook(wb);
    expect(result.map(a => a.name)).toEqual(['Segmentada', 'Coronilla']);
  });

  it('respects ARMOR_MAX_SLOTS limit of 6 rows below the header', () => {
    const wb = buildArmorsWorkbook({
      armors: [
        { name: 'A', quality: 0 },
        { name: 'B', quality: 0 },
        { name: 'C', quality: 0 },
        { name: 'D', quality: 0 },
        { name: 'E', quality: 0 },
        { name: 'F', quality: 0 },
        { name: 'G_ignorada', quality: 0 } // séptima, fuera del límite
      ]
    });
    const result = readArmorsFromWorkbook(wb);
    expect(result).toHaveLength(6);
    expect(result.map(a => a.name)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });
});
