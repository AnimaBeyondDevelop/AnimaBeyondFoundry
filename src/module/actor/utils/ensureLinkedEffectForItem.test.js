import { ensureLinkedEffectForItem } from './ensureLinkedEffectForItem.js';

/**
 * Behaviour contract for the helper that materializes an ActiveEffect
 * document on the actor from a system "effect" Item. Used both from the
 * sheet (_onDropItem) and from the global createItem hook so dropping an
 * effect onto a token also creates the AE.
 */

const setupFoundryUtils = () => {
  globalThis.foundry = {
    ...(globalThis.foundry ?? {}),
    utils: {
      ...(globalThis.foundry?.utils ?? {}),
      mergeObject: (a, b, _opts) => ({ ...a, ...b })
    }
  };
};


/** Tiny stand-in for jest.fn() — Jest 26 + experimental-vm-modules does not
 *  always expose `jest` globally in ESM tests, so we roll our own minimal
 *  spy with `.mock.calls` so the assertions below keep working. */
function makeSpy(impl) {
  const calls = [];
  const fn = async (...args) => {
    calls.push(args);
    if (typeof impl === 'function') return impl(...args);
    return undefined;
  };
  fn.mock = { calls };
  return fn;
}

describe('ensureLinkedEffectForItem', () => {
  beforeAll(setupFoundryUtils);

  const makeItem = ({ id = 'I1', name = 'Sangre de Orochi', active = false, effectData = {} } = {}) => ({
    _id: id,
    id,
    uuid: `Actor.A.Item.${id}`,
    name,
    img: 'icons/svg/aura.svg',
    system: { active, effectData }
  });

  const makeActor = ({ effects = [], createSpy } = {}) => ({
    effects: { contents: effects },
    createEmbeddedDocuments: createSpy ?? makeSpy(async (_type, [data]) => [{ ...data, id: 'AE1' }])
  });

  it('returns null when actor or item is missing', async () => {
    expect(await ensureLinkedEffectForItem(null, makeItem())).toBeNull();
    expect(await ensureLinkedEffectForItem(makeActor(), null)).toBeNull();
  });

  it('creates an AE on the actor when none is linked yet', async () => {
    const item = makeItem({
      effectData: {
        changes: [{ key: 'system.combat.attack.final.value', value: '20', type: 'add' }]
      }
    });
    const createSpy = makeSpy(async (_type, [data]) => [{ ...data, id: 'AE1' }]);
    const actor = makeActor({ createSpy });

    const created = await ensureLinkedEffectForItem(actor, item);

    expect(createSpy.mock.calls).toHaveLength(1);
    expect(created.origin).toBe('Actor.A.Item.I1');
    expect(created.disabled).toBe(true); // item.system.active = false
    expect(created.name).toBe('Sangre de Orochi');
    expect(created.changes).toEqual([
      { key: 'system.combat.attack.final.value', value: '20', type: 'add' }
    ]);
  });

  it('returns the existing AE without creating a duplicate', async () => {
    const item = makeItem();
    const existing = { id: 'AE1', origin: 'Actor.A.Item.I1' };
    const createSpy = makeSpy();
    const actor = makeActor({ effects: [existing], createSpy });

    const result = await ensureLinkedEffectForItem(actor, item);

    expect(result).toBe(existing);
    expect(createSpy.mock.calls).toHaveLength(0);
  });

  it('finds the existing AE in unlinked tokens via the .Item.<id> tail', async () => {
    // Token delta uuid form
    const item = { _id: 'I1', id: 'I1', uuid: 'Scene.S.Token.T.Actor.A.Item.I1', name: 'X', img: '', system: { active: true, effectData: {} } };
    const existing = { id: 'AE1', origin: 'Actor.A.Item.I1' }; // world-form origin
    const createSpy = makeSpy();
    const actor = makeActor({ effects: [existing], createSpy });

    const result = await ensureLinkedEffectForItem(actor, item);

    expect(result).toBe(existing);
    expect(createSpy.mock.calls).toHaveLength(0);
  });

  it('respects active=true on the item (creates AE not disabled)', async () => {
    const item = makeItem({ active: true });
    const createSpy = makeSpy(async (_type, [data]) => [{ ...data, id: 'AE1' }]);
    const actor = makeActor({ createSpy });

    const created = await ensureLinkedEffectForItem(actor, item);

    expect(created.disabled).toBe(false);
  });

  it('strips any stale origin from item.system.effectData', async () => {
    const item = makeItem({
      effectData: {
        origin: 'Actor.OLD.Item.OLD',
        changes: []
      }
    });
    const createSpy = makeSpy(async (_type, [data]) => [{ ...data, id: 'AE1' }]);
    const actor = makeActor({ createSpy });

    const created = await ensureLinkedEffectForItem(actor, item);

    expect(created.origin).toBe('Actor.A.Item.I1');
  });
});
