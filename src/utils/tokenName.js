// Returns token's display name if possible, else actor's name.
// Supports v13 UUID ("Scene.X.Token.Y") and raw canvas id.
export function resolveTokenName({ tokenUuid, actorUuid }, { message } = {}) {
  // Try UUID -> doc/object
  if (tokenUuid && typeof tokenUuid === 'string' && tokenUuid.includes('.')) {
    try {
      const doc = fromUuidSync(tokenUuid); // TokenDocument
      const live = doc?.object ?? null; // Token on canvas if rendered
      return live?.name ?? doc?.name ?? null;
    } catch {
      /* ignore */
    }
  }
  // Try raw id on canvas
  if (tokenUuid) {
    const live = canvas?.tokens?.get?.(tokenUuid);
    if (live) return live.name ?? live.document?.name ?? null;
  }
  // Try same scene by actor
  if (actorUuid) {
    const sceneId = message?.speaker?.scene;
    if (sceneId) {
      const tokDoc = game.scenes
        ?.get(sceneId)
        ?.tokens?.find(t => t.actorId === actorUuid);
      if (tokDoc) return tokDoc.name ?? null;
    }
    // Any scene
    for (const s of game.scenes ?? []) {
      const tokDoc = s.tokens?.find(t => t.actorId === actorUuid);
      if (tokDoc) return tokDoc.name ?? null;
    }
  }
  // Fallback: actor name
  return actorUuid ? game.actors.get(actorUuid)?.name ?? null : null;
}
