/**
 * Tests "Excel-resistant" para parseWeapons + tests del linking ammo→weapon.
 *
 * Anclajes críticos del Excel comunitario:
 *   - Named Range "Tabla_Combate" como apuntador a la matriz de armas.
 *   - Layout 17 filas × N columnas dentro del rango.
 *   - Fila NAME en posición 1 (1-based), QUALITY en 2, etc.
 *   - Mapeo de strings de Excel ("dos manos", "similar") a enums del sistema.
 *
 * Si una nueva versión del Excel cambia algo, el test correspondiente falla
 * con mensaje concreto indicando qué anclaje se rompió.
 *
 * También cubre el ammoIdMap: cuando se pasa, las armas guardan ammoId en su
 * system para que el dropdown de munición de la hoja del PJ funcione.
 */
import { readWeaponsFromWorkbook, importWeaponsToActor } from './parseWeapons.js';
import { buildWeaponsWorkbook } from './__fixtures__/buildWorkbook.js';
import { _clearCache } from './compendiumMatch.js';

function makePack(items) {
  return { getDocuments: async () => items };
}

function makeItem(name, type, system = {}) {
  return {
    name,
    type,
    toObject() {
      return {
        _id: 'fake_' + name,
        name,
        type,
        system: JSON.parse(JSON.stringify(system)),
        ownership: { default: 0 }
      };
    }
  };
}

function makeActor() {
  const created = [];
  let counter = 0;
  return {
    created,
    createEmbeddedDocuments: async (kind, items) => {
      const withIds = items.map(i => ({ ...i, _id: 'w_' + (++counter) }));
      created.push(...withIds);
      return withIds;
    }
  };
}

beforeAll(() => {
  globalThis.foundry = {
    utils: {
      mergeObject(a, b) {
        const out = { ...(a || {}) };
        for (const [k, v] of Object.entries(b || {})) {
          out[k] = v && typeof v === 'object' && !Array.isArray(v)
            ? globalThis.foundry.utils.mergeObject(out[k], v)
            : v;
        }
        return out;
      }
    }
  };
});

beforeEach(() => {
  _clearCache();
});

describe('readWeaponsFromWorkbook', () => {
  it('returns null when the Tabla_Combate named range is missing', () => {
    const wb = buildWeaponsWorkbook({ namedRangeName: 'OtroNombre', weapons: [] });
    // Si la comunidad renombra el named range, el parser devuelve null para
    // que la capa orquestadora avise "Excel no estándar".
    expect(readWeaponsFromWorkbook(wb)).toBeNull();
  });

  it('reads weapons from the canonical AW30:BF46 location', () => {
    const wb = buildWeaponsWorkbook({
      weapons: [
        { name: 'Lanza', quality: 5, knowledge: 'Similar', ammo: '-', ammoQuality: 0, hands: '1 o 2 manos' },
        { name: 'Saetas', quality: 0, knowledge: '', ammo: '-', ammoQuality: 0, hands: 'Dos manos' }
      ]
    });
    const result = readWeaponsFromWorkbook(wb);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Lanza');
    expect(result[0].quality).toBe(5);
    expect(result[0].knowledge).toBe('similar');
    expect(result[0].hands).toBe('one_or_two_hands');
    expect(result[1].hands).toBe('two_hands');
  });

  it('still finds weapons when the named range is relocated', () => {
    // Caso clave: si la comunidad mueve la tabla a otra posición pero
    // conserva el Named Range, el parser DEBE seguir funcionando.
    const wb = buildWeaponsWorkbook({
      topLeft: { r: 5, c: 10 },
      weapons: [{ name: 'Sable', quality: 0 }]
    });
    const result = readWeaponsFromWorkbook(wb);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Sable');
  });

  it('skips empty and dash-marked weapon slots', () => {
    const wb = buildWeaponsWorkbook({
      weapons: [
        { name: 'Lanza', quality: 5 },
        {},
        { name: '-', quality: 0 },
        { name: 'Sable', quality: 10 }
      ]
    });
    const result = readWeaponsFromWorkbook(wb);
    expect(result.map(w => w.name)).toEqual(['Lanza', 'Sable']);
    expect(result[0].slot).toBe(1);
    expect(result[1].slot).toBe(4);
  });

  it('maps the "una mano" variants correctly', () => {
    const wb = buildWeaponsWorkbook({
      weapons: [
        { name: 'A', hands: 'Una mano' },
        { name: 'B', hands: 'A una mano' },
        { name: 'C', hands: '1 o 2 manos' },
        { name: 'D', hands: 'Dos manos' },
        { name: 'E', hands: 'A dos manos' },
        { name: 'F', hands: 'Una o dos manos' }
      ]
    });
    const result = readWeaponsFromWorkbook(wb);
    expect(result.map(w => w.hands)).toEqual([
      'one_hand',
      'one_hand',
      'one_or_two_hands',
      'two_hands',
      'two_hands',
      'one_or_two_hands'
    ]);
  });

  it('maps knowledge types and defaults unknown values to "known"', () => {
    const wb = buildWeaponsWorkbook({
      weapons: [
        { name: 'A', knowledge: 'Similar' },
        { name: 'B', knowledge: 'Mixta' },
        { name: 'C', knowledge: 'Distinta' },
        { name: 'D', knowledge: 'Cualquier otra cosa' },
        { name: 'E' }
      ]
    });
    const result = readWeaponsFromWorkbook(wb);
    expect(result.map(w => w.knowledge)).toEqual([
      'similar',
      'mixed',
      'different',
      'known',
      'known'
    ]);
  });

  it('captures associated ammo and ammoQuality when present', () => {
    const wb = buildWeaponsWorkbook({
      weapons: [
        { name: 'Arco', ammo: 'Saetas', ammoQuality: 5 },
        { name: 'Daga', ammo: '-', ammoQuality: 0 }
      ]
    });
    const result = readWeaponsFromWorkbook(wb);
    expect(result[0].ammo).toBe('Saetas');
    expect(result[0].ammoQuality).toBe(5);
    expect(result[1].ammo).toBeNull();
  });
});

describe('importWeaponsToActor — linking ammo → weapon', () => {
  it('sets system.ammoId on compendium-matched weapons when the ammo is in the map', async () => {
    // Caso real: arma matcheada al compendio + munición ya importada.
    globalThis.game.packs = { get: () => makePack([makeItem('Pistola', 'weapon', {})]) };
    const actor = makeActor();
    const ammoIdMap = { Balas: 'created_42' };

    await importWeaponsToActor(actor, [
      { slot: 1, name: 'Pistola', quality: 0, knowledge: 'known', ammo: 'Balas', ammoQuality: 0, hands: null }
    ], ammoIdMap);

    expect(actor.created).toHaveLength(1);
    expect(actor.created[0].system.ammoId).toBe('created_42');
  });

  it('does NOT set system.ammoId when the weapon has no ammo in Excel', async () => {
    globalThis.game.packs = { get: () => makePack([makeItem('Sable', 'weapon', {})]) };
    const actor = makeActor();

    await importWeaponsToActor(actor, [
      { slot: 1, name: 'Sable', quality: 0, knowledge: 'known', ammo: null, ammoQuality: 0, hands: 'one_hand' }
    ], { Balas: 'created_42' });

    expect(actor.created[0].system.ammoId).toBeUndefined();
  });

  it('does NOT set system.ammoId when the ammo is not in the map', async () => {
    globalThis.game.packs = { get: () => makePack([makeItem('Pistola', 'weapon', {})]) };
    const actor = makeActor();

    await importWeaponsToActor(actor, [
      { slot: 1, name: 'Pistola', quality: 0, knowledge: 'known', ammo: 'Balas', ammoQuality: 0, hands: null }
    ], {}); // mapa vacío

    expect(actor.created[0].system.ammoId).toBeUndefined();
  });

  it('also sets ammoId on the fallback item when the weapon is not in the compendium', async () => {
    globalThis.game.packs = { get: () => makePack([]) }; // pack vacío
    const actor = makeActor();

    const result = await importWeaponsToActor(actor, [
      { slot: 1, name: 'Pistola exótica', quality: 0, knowledge: 'known', ammo: 'Balas', ammoQuality: 0, hands: null }
    ], { Balas: 'created_99' });

    expect(result.notFound).toEqual(['Pistola exótica']);
    expect(actor.created[0].system.ammoId).toBe('created_99');
  });

  it('links the weapon to whatever ammo the Excel says, not to a fixed pairing', async () => {
    // El enlace arma→munición se basa exclusivamente en la columna AMMO del
    // Excel. Cualquier arma puede usar cualquier munición. Test paranoico
    // contra hardcoding accidental futuro: si alguien introduce una rama
    // tipo "si arma es Ballesta usa Saeta", este test peta.
    globalThis.game.packs = {
      get: () => makePack([
        makeItem('Ballesta', 'weapon', {}),
        makeItem('Pistola', 'weapon', {})
      ])
    };
    const actor = makeActor();
    // Combinación intencionalmente "rara": Ballesta usando Balas mágicas,
    // Pistola usando Saetas. Inverso al pareo "natural".
    const ammoIdMap = {
      'Balas mágicas': 'ammo_alpha',
      'Saetas curvas': 'ammo_beta'
    };

    await importWeaponsToActor(actor, [
      { slot: 1, name: 'Ballesta', quality: 0, knowledge: 'known', ammo: 'Balas mágicas', ammoQuality: 0, hands: null },
      { slot: 2, name: 'Pistola', quality: 0, knowledge: 'known', ammo: 'Saetas curvas', ammoQuality: 0, hands: null }
    ], ammoIdMap);

    const byName = Object.fromEntries(actor.created.map(w => [w.name, w.system.ammoId]));
    expect(byName['Ballesta']).toBe('ammo_alpha');
    expect(byName['Pistola']).toBe('ammo_beta');
  });
});
