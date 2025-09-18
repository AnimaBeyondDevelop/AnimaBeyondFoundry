import { autoRollDefenseAgainstAttack } from '../../module/combat/autoDefense.js';
import { Templates } from '../../module/utils/constants';
import { updateAttackTargetsFlag } from '../../utils/updateAttackTargetsFlag.js';

export default async function autoDefendActionHandler(message, _html, ds) {
  try {
    const msg = game.messages.get(ds.messageId ?? message?.id ?? null);
    // attack data (prefer dataset)
    const attackData =
      (typeof ds.attackData === 'string'
        ? safeParseJSON(ds.attackData)
        : ds.attackData) ??
      msg?.getFlag(game.abf.id, 'attackData') ??
      msg?.flags?.abf?.attackData ??
      null;

    if (!attackData) return ui.notifications?.warn('Datos de ataque no disponibles.');

    // Selected tokens the user can control
    const tokens = (canvas.tokens?.controlled ?? []).filter(t => canDefendWithToken(t));
    if (!tokens.length)
      return ui.notifications?.warn('No hay tokens seleccionados válidos.');

    const entries = [];
    for (const tok of tokens) {
      const r = await autoRollDefenseAgainstAttack({ defenderToken: tok, attackData });
      // mark done in the original attack message if provided
      if (msg?.id) {
        await updateAttackTargetsFlag(msg.id, {
          actorUuid: r.actor.id,
          tokenUuid: tok.id,
          state: 'done',
          rolledBy: game.user.id,
          defenseResult: r.defenseData.toJSON?.() ?? r.defenseData,
          updatedAt: Date.now()
        });
      }
      entries.push(entryFromAuto(r));
    }

    // Render consolidated message
    const content = await renderTemplate(Templates.Chat.MultiDefenseResult, {
      attackLabel: attackData?.weaponId
        ? game.i18n.localize?.('chat.attackData.title') ?? 'Ataque'
        : 'Ataque',
      entries,
      hasRemaining: entries.some(e => !e.applied && e.damageFinal > 0),
      messageId: randomID() // overridden by ChatMessage.create id; we set again below for data-*
    });

    const cm = await ChatMessage.create({
      content,
      speaker: ChatMessage.getSpeaker({ actor: tokens[0]?.actor }),
      flags: {
        abf: {
          kind: 'multiDefenseResult',
          sourceAttackMessageId: msg?.id ?? null,
          batch: { createdAt: Date.now() },
          entries: entries.map(e => ({ ...e, applied: false }))
        }
      }
    });

    // re-render with messageId so buttons carry it
    const content2 = await renderTemplate(Templates.Chat.MultiDefenseResult, {
      attackLabel: attackData?.weaponId
        ? game.i18n.localize?.('chat.attackData.title') ?? 'Ataque'
        : 'Ataque',
      entries: cm.getFlag(game.abf.id, 'entries') ?? entries,
      hasRemaining: (cm.getFlag(game.abf.id, 'entries') ?? entries).some(
        e => !e.applied && e.damageFinal > 0
      ),
      messageId: cm.id
    });
    await cm.update({ content: content2 });
  } catch (err) {
    console.error('[ABF] autoDefendActionHandler error:', err);
    ui.notifications?.error('No se pudo ejecutar la defensa automática.');
  }
}
export const action = 'auto-defend';

function canDefendWithToken(tok) {
  if (!tok?.actor) return false;
  if (game.user.isGM) return true;
  return tok.actor.testUserPermission?.(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
}

function safeParseJSON(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function entryFromAuto(r) {
  return {
    actorId: r.actor.id,
    tokenId: r.token?.id ?? '',
    label: r.actor.name,
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
