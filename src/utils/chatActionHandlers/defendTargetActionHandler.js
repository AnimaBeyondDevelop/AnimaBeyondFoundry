import { DefenseConfigurationDialog } from '../../module/dialogs/DefenseConfigurationDialog';
import { ABFAttackData } from '../../module/combat/ABFAttackData';
import { sendAccumulationZeroDefense } from '../sendAccumulationZeroDefense.js';

async function defendTargetActionHandler(message, _html, dataset) {
  try {
    const messageId = dataset.messageId ?? message?.id;
    const msg = game.messages.get(messageId);
    if (!msg) return ui.notifications?.warn('Mensaje no encontrado.');

    const rawAtk =
      msg.getFlag(game.animabf.id, 'attackData') ?? msg.flags?.animabf?.attackData;
    if (!rawAtk) return ui.notifications?.warn('Datos de ataque no disponibles.');

    const atk = ABFAttackData.fromJSON(rawAtk);

    // Resolve attacker token (optional)
    let attackerToken = message?.speaker?.token
      ? canvas.tokens.get(message.speaker.token)
      : null;

    if (!attackerToken && atk.attackerId) {
      attackerToken =
        canvas.tokens.placeables.find(t => t.actor?.id === atk.attackerId) ?? null;
    }

    // ---- IMPORTANT: resolve the target from the stored entry (like auto-defend) ----
    const targets = msg.getFlag(game.animabf.id, 'targets') ?? [];

    const targetTokenId = dataset.targetToken ?? dataset['target-token'] ?? '';
    const targetActorId =
      dataset.targetActor ?? dataset['target-actor'] ?? dataset.target ?? '';

    // Pick the best matching entry:
    // 1) match by token id/uuid if provided
    // 2) else match by actor id (but prefer one that has tokenUuid)
    let targetEntry = null;

    if (targetTokenId) {
      targetEntry =
        targets.find(t => t?.tokenUuid === targetTokenId) ??
        targets.find(t => (t?.tokenUuid ?? '').endsWith(`.${targetTokenId}`)) ??
        null;
    }
    if (!targetEntry && targetActorId) {
      targetEntry =
        targets.find(t => t?.actorUuid === targetActorId && t?.tokenUuid) ??
        targets.find(t => t?.actorUuid === targetActorId) ??
        null;
    }

    // Resolve token from entry; fallback to dataset token id
    let defenderToken = targetEntry ? resolveTokenForTarget(targetEntry, message) : null;
    if (!defenderToken && targetTokenId)
      defenderToken = canvas.tokens.get(targetTokenId) ?? null;

    // Final fallback by actor id (last resort)
    if (!defenderToken && targetActorId) {
      defenderToken =
        canvas.tokens.placeables.find(t => t.actor?.id === targetActorId) ?? null;
    }

    if (!defenderToken)
      return ui.notifications?.warn('No se encontró el token del objetivo.');

    // Permissions: GM or owner
    if (!game.user.isGM) {
      const ok = defenderToken.actor?.testUserPermission(
        game.user,
        CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
      );
      if (!ok) return ui.notifications?.warn('Sin permisos para defender este objetivo.');
    }

    const defenseMode =
      defenderToken.actor?.system?.general?.settings?.defenseType?.value;

    // Use the stored token key when present, so the flag update hits the correct entry
    const storedTokenKey = targetEntry?.tokenUuid ?? '';

    if (defenseMode === 'resistance') {
      await sendAccumulationZeroDefense({
        defenderToken,
        attackerToken,
        attackData: atk,
        messageId,
        storedTokenKey
      });
      return;
    }

    new DefenseConfigurationDialog(
      {
        defender: defenderToken,
        attacker: attackerToken ?? undefined,
        attackData: atk,
        weaponId: atk.weaponId,
        messageId
      },
      { allowed: true }
    ).render(true);
  } catch (err) {
    console.error(err);
    ui.notifications?.error('No se pudo abrir la defensa.');
  }
}

export default defendTargetActionHandler;
export const action = 'defend-target';

/** Resolve token from target entry supporting UUID (Scene.X.Token.Y) or raw id */
function resolveTokenForTarget(t, message) {
  const id = t?.tokenUuid ?? '';
  // UUID path
  if (id && id.includes('.')) {
    try {
      const doc = fromUuidSync(id); // TokenDocument
      return doc?.object ?? null; // Token on canvas if present
    } catch {
      /* noop */
    }
  }
  // Raw canvas id
  if (id) {
    const onCanvas = canvas.tokens?.get?.(id);
    if (onCanvas) return onCanvas;
  }
  // Fallback by actor id (same scene first)
  const actorId = t?.actorUuid ?? '';
  if (actorId) {
    const sceneId = message?.speaker?.scene;
    if (sceneId) {
      const tok = game.scenes?.get(sceneId)?.tokens?.find(tt => tt.actorId === actorId);
      const live = tok ? canvas.tokens?.get?.(tok.id) : null;
      if (live) return live;
    }
    return canvas.tokens?.placeables?.find(tt => tt.actor?.id === actorId) ?? null;
  }
  return null;
}
