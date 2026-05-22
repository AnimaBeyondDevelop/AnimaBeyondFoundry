import {
  findInCompendium,
  cloneCompendiumItem,
  _clearCache
} from './compendiumMatch.js';

/**
 * Mock minimal de un pack del compendio Foundry. Cada item lleva `name` +
 * `type` (weapon | armor | ammo) y un `toObject()` que devuelve un clon
 * plano apto para cloneCompendiumItem.
 */
function makePack(items) {
  return {
    getDocuments: async () => items
  };
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

// foundry.utils.mergeObject lo usa cloneCompendiumItem. En jest.setup.js no
// está definido, así que lo mockeamos como un merge profundo simple.
beforeAll(() => {
  globalThis.foundry = {
    utils: {
      mergeObject(original, other) {
        const out = { ...(original || {}) };
        for (const [k, v] of Object.entries(other || {})) {
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            out[k] = globalThis.foundry.utils.mergeObject(out[k], v);
          } else {
            out[k] = v;
          }
        }
        return out;
      }
    }
  };
});

beforeEach(() => {
  _clearCache();
});

describe('findInCompendium', () => {
  it('returns null when name is empty', async () => {
    globalThis.game.packs = { get: () => makePack([]) };
    expect(await findInCompendium('weapons', '')).toBeNull();
    expect(await findInCompendium('weapons', null)).toBeNull();
  });

  it('returns null when nothing matches', async () => {
    globalThis.game.packs = { get: () => makePack([makeItem('Espada corta', 'weapon')]) };
    expect(await findInCompendium('weapons', 'Cosa inventada')).toBeNull();
  });

  it('matches exact name case-insensitive and without diacritics', async () => {
    const items = [makeItem('Lanza', 'weapon'), makeItem('Sable de duelo', 'weapon')];
    globalThis.game.packs = { get: () => makePack(items) };

    expect((await findInCompendium('weapons', 'LANZA'))?.name).toBe('Lanza');

    _clearCache();
    expect((await findInCompendium('weapons', 'sable de duélo'))?.name).toBe('Sable de duelo');
  });

  it('applies the espada a dos manos -> mandoble alias', async () => {
    const items = [makeItem('Mandoble', 'weapon'), makeItem('Espada corta', 'weapon')];
    globalThis.game.packs = { get: () => makePack(items) };

    expect((await findInCompendium('weapons', 'Espada a dos manos'))?.name).toBe('Mandoble');
  });

  it('falls back to singular when input ends in -s', async () => {
    const items = [makeItem('Saeta', 'ammo')];
    globalThis.game.packs = { get: () => makePack(items) };

    expect((await findInCompendium('ammo', 'Saetas'))?.name).toBe('Saeta');
  });

  it('falls back to stem when input ends in -es', async () => {
    const items = [makeItem('Patron', 'weapon')];
    globalThis.game.packs = { get: () => makePack(items) };

    expect((await findInCompendium('weapons', 'Patrones'))?.name).toBe('Patron');
  });

  it('appends -s when the compendium name is a single word in plural', async () => {
    // Caso del único alias mono-palabra-plural detectado hoy. Tests con frases
    // multi-palabra ("Piedra de honda" → "Piedras de honda") NO se cubren:
    // el algoritmo solo añade/quita sufijos en la palabra completa final, no
    // por palabra. Si aparece ese caso, hay que añadir un alias explícito.
    const items = [makeItem('Saetas', 'ammo')];
    globalThis.game.packs = { get: () => makePack(items) };

    expect((await findInCompendium('ammo', 'Saeta'))?.name).toBe('Saetas');
  });

  it('filters by item type when loading the weapons pack', async () => {
    // El pack 'weapons' mezcla weapons y ammo. logicalType="weapons" solo ve
    // weapons; logicalType="ammo" solo ve ammo. Esto previene que un arma
    // llamada igual que una munición (o viceversa) cause matches cruzados.
    const mixed = [
      makeItem('Lanza', 'weapon'),
      makeItem('Saeta', 'ammo')
    ];
    globalThis.game.packs = { get: () => makePack(mixed) };

    expect(await findInCompendium('weapons', 'Saeta')).toBeNull();

    _clearCache();
    expect(await findInCompendium('ammo', 'Lanza')).toBeNull();

    _clearCache();
    expect((await findInCompendium('weapons', 'Lanza'))?.name).toBe('Lanza');

    _clearCache();
    expect((await findInCompendium('ammo', 'Saeta'))?.name).toBe('Saeta');
  });

  it('returns null gracefully when the pack does not exist', async () => {
    globalThis.game.packs = { get: () => null };
    expect(await findInCompendium('weapons', 'Lanza')).toBeNull();
  });
});

describe('cloneCompendiumItem', () => {
  it('strips _id and ownership, applies system overrides', () => {
    const doc = makeItem('Lanza', 'weapon', {
      damage: { final: { value: 50 } },
      quality: { value: 0 },
      equipped: { value: false }
    });

    const cloned = cloneCompendiumItem(doc, {
      quality: { value: 10 },
      equipped: { value: true }
    });

    expect(cloned._id).toBeUndefined();
    expect(cloned.ownership).toBeUndefined();
    expect(cloned.name).toBe('Lanza');
    expect(cloned.system.quality.value).toBe(10);
    expect(cloned.system.equipped.value).toBe(true);
    // Untouched fields survive
    expect(cloned.system.damage.final.value).toBe(50);
  });

  it('does not mutate the original document', () => {
    const doc = makeItem('Lanza', 'weapon', { quality: { value: 0 } });
    const before = JSON.stringify(doc.toObject());

    cloneCompendiumItem(doc, { quality: { value: 99 } });

    const after = JSON.stringify(doc.toObject());
    expect(after).toBe(before);
  });
});
