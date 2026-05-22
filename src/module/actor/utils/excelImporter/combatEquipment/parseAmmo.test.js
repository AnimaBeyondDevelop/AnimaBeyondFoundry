/**
 * Tests para la deduplicación de munición y la construcción del idMap.
 *
 * parseAmmo NO lee el Excel directamente. Recibe el array de armas que
 * readWeaponsFromWorkbook ya devolvió (cada arma con su campo `ammo` /
 * `ammoQuality`) y produce items únicos por nombre de munición, con la
 * lista de armas asociadas y un idMap { excelName → _id } que
 * importWeaponsToActor usa para enlazar arma → munición.
 *
 * Estos tests cubren la lógica de dedupe + match a compendio + idMap. Los
 * anclajes del Excel se cubren en parseWeapons.test.js.
 */
import { importAmmoToActor } from './parseAmmo.js';
import { _clearCache } from './compendiumMatch.js';

function makePack(items) {
  return { getDocuments: async () => items };
}

function makeItem(name, type) {
  return {
    name,
    type,
    toObject() {
      return {
        _id: 'fake_' + name,
        name,
        type,
        system: { quality: { value: 0 } },
        ownership: { default: 0 }
      };
    }
  };
}

/**
 * Mock de actor. createEmbeddedDocuments emula el comportamiento de Foundry:
 * asigna un _id único a cada item creado y devuelve los items con ese _id.
 */
function makeActor() {
  const created = [];
  let counter = 0;
  return {
    created,
    createEmbeddedDocuments: async (kind, items) => {
      const withIds = items.map(i => ({ ...i, _id: 'created_' + (++counter) }));
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

describe('importAmmoToActor', () => {
  it('returns zero counters and empty idMap when there is no ammo to import', async () => {
    globalThis.game.packs = { get: () => makePack([]) };
    const actor = makeActor();
    const result = await importAmmoToActor(actor, [
      { name: 'Daga', ammo: null, ammoQuality: 0 }
    ]);
    expect(result).toEqual({ imported: 0, notFound: [], idMap: {} });
    expect(actor.created).toEqual([]);
  });

  it('deduplicates ammo shared by multiple weapons', async () => {
    globalThis.game.packs = { get: () => makePack([makeItem('Saetas', 'ammo')]) };
    const actor = makeActor();
    const result = await importAmmoToActor(actor, [
      { name: 'Arco corto', ammo: 'Saetas', ammoQuality: 5 },
      { name: 'Arco largo', ammo: 'Saetas', ammoQuality: 0 },
      { name: 'Ballesta', ammo: 'Saetas', ammoQuality: 0 }
    ]);
    expect(result.imported).toBe(1);
    expect(actor.created).toHaveLength(1);
    expect(actor.created[0].flags.animabf.excelImport.associatedWeapons).toEqual([
      'Arco corto',
      'Arco largo',
      'Ballesta'
    ]);
  });

  it('builds idMap with the created _id for each unique ammo name', async () => {
    globalThis.game.packs = {
      get: () => makePack([makeItem('Saetas', 'ammo'), makeItem('Balas', 'ammo')])
    };
    const actor = makeActor();
    const result = await importAmmoToActor(actor, [
      { name: 'Arco', ammo: 'Saetas', ammoQuality: 0 },
      { name: 'Pistola', ammo: 'Balas', ammoQuality: 0 }
    ]);
    expect(result.imported).toBe(2);
    expect(Object.keys(result.idMap)).toEqual(expect.arrayContaining(['Saetas', 'Balas']));
    // Cada idMap value debe ser un _id no vacío.
    expect(result.idMap['Saetas']).toMatch(/^created_/);
    expect(result.idMap['Balas']).toMatch(/^created_/);
    expect(result.idMap['Saetas']).not.toBe(result.idMap['Balas']);
  });

  it('ignores ammo markers "-" and "0"', async () => {
    globalThis.game.packs = { get: () => makePack([]) };
    const actor = makeActor();
    const result = await importAmmoToActor(actor, [
      { name: 'Lanza', ammo: '-', ammoQuality: 0 },
      { name: 'Daga', ammo: '0', ammoQuality: 0 }
    ]);
    expect(result.imported).toBe(0);
    expect(result.idMap).toEqual({});
    expect(actor.created).toEqual([]);
  });

  it('creates a fallback item when ammo is not in the compendium', async () => {
    globalThis.game.packs = { get: () => makePack([]) }; // pack vacío
    const actor = makeActor();
    const result = await importAmmoToActor(actor, [
      { name: 'Arco', ammo: 'Munición exótica', ammoQuality: 3 }
    ]);
    expect(result.imported).toBe(1);
    expect(result.notFound).toEqual(['Munición exótica']);
    expect(actor.created[0].name).toBe('Munición exótica');
    expect(actor.created[0].type).toBe('ammo');
    expect(actor.created[0].system.quality.value).toBe(3);
    expect(actor.created[0].flags.animabf.excelImport.unmatched).toBe(true);
    // El fallback también va al idMap para que el arma pueda enlazar.
    expect(result.idMap['Munición exótica']).toMatch(/^created_/);
  });

  it('builds the right idMap even when createEmbeddedDocuments returns items reordered', async () => {
    // Foundry no garantiza que el array devuelto por createEmbeddedDocuments
    // respete el orden del input — los items se crean en batch y pueden venir
    // en orden distinto. Validamos que el matching es por flag excelName, no
    // por índice.
    globalThis.game.packs = {
      get: () => makePack([makeItem('Saeta', 'ammo'), makeItem('Balas', 'ammo')])
    };
    const actor = {
      created: [],
      createEmbeddedDocuments: async (kind, items) => {
        // Reordena: devuelve invertido respecto al input.
        const withIds = items.map((i, idx) => ({ ...i, _id: 'fake_' + idx }));
        return withIds.reverse();
      }
    };

    const result = await importAmmoToActor(actor, [
      { name: 'Ballesta', ammo: 'Saeta', ammoQuality: 0 },
      { name: 'Pistola', ammo: 'Balas', ammoQuality: 0 }
    ]);

    // Si el matching es por índice, idMap['Saeta'] sería el _id de Balas y
    // viceversa. Si es por flag (que es como queremos), cada nombre Excel
    // apunta al _id correcto.
    expect(result.idMap['Saeta']).toBe('fake_0');
    expect(result.idMap['Balas']).toBe('fake_1');
  });
});
