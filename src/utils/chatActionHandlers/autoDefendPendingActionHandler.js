import { autoRollDefenseAgainstAttack } from '../../module/combat/autoRollDefenseAgainstAttack.js';
import { Templates } from '../../module/utils/constants';
import { updateAttackTargetsFlag } from '../../utils/updateAttackTargetsFlag.js';
import { resolveTokenName } from '../tokenName.js';
import { openModDialog } from '../../module/utils/dialogs/openSimpleInputDialog.js';

export default async function autoDefendPendingActionHandler(message, _html, ds) {
  try {
    const msg = game.messages.get(ds.messageId ?? message?.id);
    if (!msg) return ui.notifications?.warn('Mensaje de ataque no encontrado.');

    const attackData =
      (typeof ds.attackData === 'string'
        ? safeParseJSON(ds.attackData)
        : ds.attackData) ??
      msg.getFlag(game.animabf.id, 'attackData') ??
      msg.flags?.animabf?.attackData ??
      null;
    if (!attackData) return ui.notifications?.warn('Datos de ataque no disponibles.');

    const targets = msg.getFlag(game.animabf.id, 'targets') ?? [];
    const pendings = targets.filter(t => (t.state ?? 'pending') === 'pending');
    if (!pendings.length) return ui.notifications?.info('No hay objetivos pendientes.');

    const mod = await openModDialog();

    const entries = [];
    for (const t of pendings) {
      const tok = resolveTokenForTarget(t, message);
      const actor = tok?.actor ?? (t.actorUuid ? game.actors.get(t.actorUuid) : null);
      if (!actor) continue;

      if (
        !game.user.isGM &&
        !actor.testUserPermission?.(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
      ) {
        continue;
      }

      const r = await autoRollDefenseAgainstAttack({
        defenderToken: tok ?? null,
        defenderActor: actor,
        attackData,
        defenseMod: mod
      });

      await updateAttackTargetsFlag(msg.id, {
        actorUuid: r.actor.id,
        // store UUID when possible (v13 friendly)
        tokenUuid:
          r.token?.document?.uuid ??
          tok?.document?.uuid ??
          r.token?.uuid ??
          tok?.uuid ??
          tok?.id ??
          '',
        state: 'done',
        rolledBy: game.user.id,
        defenseResult: r.defenseData.toJSON?.() ?? r.defenseData,
        updatedAt: Date.now()
      });

      entries.push(entryFromAuto(r, tok));
    }

    if (!entries.length)
      return ui.notifications?.info('No se pudo auto-defender a ningún objetivo.');

    const content = await renderTemplate(Templates.Chat.MultiDefenseResult, {
      attackLabel: game.i18n.localize?.('chat.attackData.title') ?? 'Ataque',
      entries,
      hasRemaining: entries.some(e => !e.applied && e.damageFinal > 0),
      messageId: randomID()
    });

    const cm = await ChatMessage.create({
      content,
      speaker: message.speaker,
      flags: {
        animabf: {
          kind: 'multiDefenseResult',
          sourceAttackMessageId: msg.id,
          batch: { createdAt: Date.now() },
          entries: entries.map(e => ({ ...e, applied: false }))
        }
      }
    });

    const content2 = await renderTemplate(Templates.Chat.MultiDefenseResult, {
      attackLabel: game.i18n.localize?.('chat.attackData.title') ?? 'Ataque',
      entries: cm.getFlag(game.animabf.id, 'entries') ?? entries,
      hasRemaining: (cm.getFlag(game.animabf.id, 'entries') ?? entries).some(
        e => !e.applied && e.damageFinal > 0
      ),
      messageId: cm.id
    });
    await cm.update({ content: content2 });
  } catch (err) {
    console.error('[ABF] autoDefendPendingActionHandler error:', err);
    ui.notifications?.error('No se pudo auto-defender a los objetivos pendientes.');
  }
}
export const action = 'auto-defend-pending';

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

function safeParseJSON(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
function entryFromAuto(r, tok) {
  const tokenUuid =
    r.token?.document?.uuid ??
    tok?.document?.uuid ??
    r.token?.uuid ??
    tok?.uuid ??
    tok?.id ??
    '';
  const actorUuid = r.actor?.id ?? tok?.actor?.id ?? '';
  const label = resolveTokenName(
    { tokenUuid, actorUuid },
    { message: ui?.chat?.lastMessage }
  );

  return {
    actorId: r.actor.id,
    tokenId: r.token?.id ?? tok?.id ?? '',
    label: label ?? r.token?.name ?? tok?.name ?? r.actor.name, // final fallback
    defenseTotal: Number(r.defenseTotal ?? 0),
    damageFinal: Number(
      r.combatResult?.damageFinal ??
        r.combatResult?.damage?.final ??
        r.combatResult?.finalDamage ??
        r.combatResult?.damage ??
        0
    ),
    hasCounter: !!r.combatResult?.hasCounterAttack,
    counterAttackValue: Number(r.combatResult?.counterAttackValue ?? 0),
    applied: false
  };
}
