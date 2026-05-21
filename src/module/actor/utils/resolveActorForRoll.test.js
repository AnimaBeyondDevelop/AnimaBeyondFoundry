import { resolveActorForRoll, resolveActorFromSpeaker } from './resolveActorForRoll.js';

const makeTokenDoc = (actor) => ({ actor });
const makeTokenPlaceable = (actor) => ({ document: { actor } });

describe('resolveActorForRoll', () => {
  it('returns null when nothing is provided', () => {
    expect(resolveActorForRoll()).toBeNull();
    expect(resolveActorForRoll({})).toBeNull();
  });

  it('prefers a TokenDocument when given', () => {
    const tokenActor = { id: 'tokenActor', effects: { contents: ['ae1'] } };
    const tokenDoc = makeTokenDoc(tokenActor);

    expect(resolveActorForRoll({ token: tokenDoc })).toBe(tokenActor);
  });

  it('handles a Token PlaceableObject (with .document.actor)', () => {
    const tokenActor = { id: 'tokenActor' };
    const placeable = makeTokenPlaceable(tokenActor);

    expect(resolveActorForRoll({ token: placeable })).toBe(tokenActor);
  });

  it('resolves via scene + token id when no token object is passed', () => {
    const tokenActor = { id: 'tokenActor' };
    const tokenDoc = makeTokenDoc(tokenActor);
    const scene = { tokens: { get: (id) => (id === 'T1' ? tokenDoc : null) } };
    globalThis.game = {
      scenes: { get: (id) => (id === 'S1' ? scene : null) },
      actors: { get: () => null }
    };

    expect(resolveActorForRoll({ tokenId: 'T1', sceneId: 'S1' })).toBe(tokenActor);
  });

  it('prefers token over actor id when both are present', () => {
    const tokenActor = { id: 'tokenActor' };
    const worldActor = { id: 'world' };
    globalThis.game = {
      actors: { get: () => worldActor }
    };

    const tokenDoc = makeTokenDoc(tokenActor);
    expect(resolveActorForRoll({ token: tokenDoc, actorId: 'A1' })).toBe(tokenActor);
  });

  it('returns null when token has no actor and no fallback', () => {
    const tokenDoc = makeTokenDoc(null);
    globalThis.game = { actors: { get: () => null } };
    expect(resolveActorForRoll({ token: tokenDoc })).toBeNull();
  });
});

describe('resolveActorFromSpeaker', () => {
  it('returns null for falsy speaker', () => {
    expect(resolveActorFromSpeaker(null)).toBeNull();
    expect(resolveActorFromSpeaker(undefined)).toBeNull();
  });

  it('resolves to TokenActor via scene+token in the speaker', () => {
    const tokenActor = { id: 'tokenActor', effects: { contents: ['ae'] } };
    const tokenDoc = makeTokenDoc(tokenActor);
    const scene = { tokens: { get: (id) => (id === 'T1' ? tokenDoc : null) } };
    globalThis.game = {
      scenes: { get: (id) => (id === 'S1' ? scene : null) },
      actors: { get: () => ({ id: 'shouldNotBeUsed' }) }
    };

    const speaker = { token: 'T1', scene: 'S1', actor: 'shouldNotBeUsed' };
    expect(resolveActorFromSpeaker(speaker)).toBe(tokenActor);
  });

});


describe('resolveActorForRoll — sceneId null fallbacks', () => {
  it('falls back to canvas.scene when sceneId is null', () => {
    const tokenActor = { id: 'tokenActor' };
    const tokenDoc = { actor: tokenActor };
    const canvasScene = { tokens: { get: (id) => (id === 'T1' ? tokenDoc : null) } };
    globalThis.canvas = { scene: canvasScene };
    globalThis.game = {
      scenes: [],
      actors: { get: () => null }
    };
    expect(resolveActorForRoll({ tokenId: 'T1' })).toBe(tokenActor);
  });

  it('iterates all scenes when neither sceneId nor canvas helps', () => {
    const tokenActor = { id: 'tokenActor' };
    const tokenDoc = { actor: tokenActor };
    const scene1 = { tokens: { get: () => null } };
    const scene2 = { tokens: { get: (id) => (id === 'T1' ? tokenDoc : null) } };

    globalThis.canvas = { scene: null };
    globalThis.game = {
      scenes: [scene1, scene2],
      actors: { get: () => null }
    };

    expect(resolveActorForRoll({ tokenId: 'T1' })).toBe(tokenActor);
  });

  it('still falls back to world actor when no scene contains the token', () => {
    const worldActor = { id: 'world' };
    globalThis.canvas = { scene: null };
    globalThis.game = {
      scenes: [],
      actors: { get: (id) => (id === 'A1' ? worldActor : null) }
    };

    expect(resolveActorForRoll({ tokenId: 'T_unknown', actorId: 'A1' })).toBe(worldActor);
  });
});

describe('resolveActorFromSpeaker — Foundry edge case (scene=null)', () => {
  it('resolves to the TokenActor even when speaker.scene is null', () => {
    const tokenActor = { id: 'tokenActor', effects: { contents: ['ae'] } };
    const tokenDoc = { actor: tokenActor };
    const canvasScene = { tokens: { get: (id) => (id === 'T1' ? tokenDoc : null) } };
    globalThis.canvas = { scene: canvasScene };
    globalThis.game = {
      scenes: [],
      actors: { get: () => ({ id: 'shouldNotBeUsed' }) }
    };

    const speaker = { token: 'T1', scene: null, actor: 'shouldNotBeUsed' };
    expect(resolveActorFromSpeaker(speaker)).toBe(tokenActor);
  });
});
