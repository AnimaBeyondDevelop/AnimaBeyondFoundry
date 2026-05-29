import { findEffectLinkedToItem } from './findEffectLinkedToItem.js';

/**
 * Regression: in unlinked tokens, item.uuid carries a
 * `Scene.<sceneId>.Token.<tokenId>.Actor.<id>.Item.<itemId>` prefix while
 * the corresponding AE was created with `origin: item.uuid` resolved at a
 * moment when it pointed to the world form `Actor.<id>.Item.<itemId>`. A
 * direct string compare misses the link and the toggle / delete actions
 * silently no-op against the AE. We match by the trailing `.Item.<itemId>`
 * segment as a robust fallback.
 */
describe('findEffectLinkedToItem', () => {
  it('returns null when actor or item is missing', () => {
    expect(findEffectLinkedToItem(null, { uuid: 'x' })).toBeNull();
    expect(findEffectLinkedToItem({ effects: { contents: [] } }, null)).toBeNull();
  });

  it('returns null when there are no effects on the actor', () => {
    const actor = { effects: { contents: [] } };
    const item = { uuid: 'Actor.A.Item.I', _id: 'I' };
    expect(findEffectLinkedToItem(actor, item)).toBeNull();
  });

  it('matches by exact uuid (the common linked-actor case)', () => {
    const effect = { origin: 'Actor.A.Item.I' };
    const actor = { effects: { contents: [effect] } };
    const item = { uuid: 'Actor.A.Item.I', _id: 'I' };
    expect(findEffectLinkedToItem(actor, item)).toBe(effect);
  });

  it('matches by trailing .Item.<id> when prefixes diverge (unlinked token)', () => {
    // Item lives in token delta: prefixed uuid.
    const item = {
      uuid: 'Scene.S.Token.T.Actor.A.Item.I',
      _id: 'I'
    };
    // AE was created with origin pointing to the world form.
    const effect = { origin: 'Actor.A.Item.I' };
    const actor = { effects: { contents: [effect] } };

    expect(findEffectLinkedToItem(actor, item)).toBe(effect);
  });

  it('does not match a different item id even if prefixes happen to share parts', () => {
    const item = { uuid: 'Actor.A.Item.I1', _id: 'I1' };
    const effect = { origin: 'Actor.A.Item.I2' };
    const actor = { effects: { contents: [effect] } };

    expect(findEffectLinkedToItem(actor, item)).toBeNull();
  });

  it('prefers the direct uuid match over the tail match when both exist', () => {
    const item = { uuid: 'Actor.A.Item.I', _id: 'I' };
    const direct = { origin: 'Actor.A.Item.I' };
    const tail = { origin: 'Scene.S.Token.T.Actor.A.Item.I' };
    const actor = { effects: { contents: [tail, direct] } };

    expect(findEffectLinkedToItem(actor, item)).toBe(direct);
  });

  it('handles the actor.effects shape both as Foundry collection and as plain array', () => {
    const item = { uuid: 'Actor.A.Item.I', _id: 'I' };
    const effect = { origin: 'Actor.A.Item.I' };

    expect(findEffectLinkedToItem({ effects: { contents: [effect] } }, item)).toBe(effect);
    expect(findEffectLinkedToItem({ effects: [effect] }, item)).toBe(effect);
  });
});
