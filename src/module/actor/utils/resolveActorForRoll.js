// /module/actor/utils/resolveActorForRoll.js

/**
 * Single source of truth for resolving "which actor owns this roll".
 *
 * Both the attack dialog and the chat-message hook need to read the same
 * actor — the one whose `effects.contents` lists the AE currently applied
 * to the entity rolling. On unlinked tokens this is the TokenActor (with
 * its ActorDelta), NOT the world Actor of the directory.
 *
 * The helper accepts whatever the caller has at hand (a TokenDocument, a
 * Token PlaceableObject, a speaker-like object, or just an actor id) and
 * always returns the actor that has the effects applied.
 *
 * @param {Object} options
 * @param {object} [options.token]    TokenDocument or Token PlaceableObject
 * @param {string} [options.tokenId]  Token id (used with sceneId)
 * @param {string} [options.sceneId]  Scene id, mandatory if tokenId is given
 * @param {string} [options.actorId]  World actor id (fallback)
 * @returns {object|null}
 */
export function resolveActorForRoll({ token, tokenId, sceneId, actorId } = {}) {
  // 1) Token document or PlaceableObject -> their .actor is the TokenActor
  //    (with ActorDelta for unlinked tokens).
  if (token) {
    const fromToken = token.actor ?? token.document?.actor ?? null;
    if (fromToken) return fromToken;
  }

  // 2) Token id (+ optional scene id) -> resolve the TokenDocument and use
  //    its actor. Foundry's ChatMessage.getSpeaker sometimes returns
  //    speaker.scene as null even when the token is on a real scene; we
  //    fall back to the current canvas scene and finally iterate all
  //    scenes so the resolution does not break on that edge case.
  if (tokenId) {
    let tokenDoc = null;
    if (sceneId) {
      tokenDoc = game.scenes?.get(sceneId)?.tokens?.get?.(tokenId) ?? null;
    }
    if (!tokenDoc && typeof canvas !== 'undefined') {
      tokenDoc = canvas?.scene?.tokens?.get?.(tokenId) ?? null;
    }
    if (!tokenDoc && game.scenes && typeof game.scenes[Symbol.iterator] === 'function') {
      for (const s of game.scenes) {
        const t = s.tokens?.get?.(tokenId);
        if (t) { tokenDoc = t; break; }
      }
    }
    if (tokenDoc?.actor) return tokenDoc.actor;
  }

  // 3) Actor id fallback -> world actor from the directory. Last resort
  //    because this is what we DON'T want for unlinked tokens, but we keep
  //    it for actors without a token in the canvas.
  if (actorId) {
    const actor = game.actors?.get?.(actorId);
    if (actor) return actor;
  }

  return null;
}

/**
 * Convenience wrapper that takes a chat-message-style speaker and returns
 * the right actor for the trace hook.
 *
 * @param {{token?:string, scene?:string, actor?:string}} speaker
 * @returns {object|null}
 */
export function resolveActorFromSpeaker(speaker) {
  if (!speaker) return null;
  return resolveActorForRoll({
    tokenId: speaker.token,
    sceneId: speaker.scene,
    actorId: speaker.actor
  });
}
