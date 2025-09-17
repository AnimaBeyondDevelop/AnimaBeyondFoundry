import { autoRollDefenseAgainstAttack } from '../../module/combat/autoDefense.js';
import { Templates } from '../../module/utils/constants';
import { updateAttackTargetsFlag } from '../../utils/updateAttackTargetsFlag.js';

export default async function autoDefendPendingActionHandler(message, _html, ds) {
  try {
    const msg = game.messages.get(ds.messageId ?? message?.id);
    if (!msg) return ui.notifications?.warn('Mensaje de ataque no encontrado.');

    const attackData =
      (typeof ds.attackData === 'string'
        ? safeParseJSON(ds.attackData)
        : ds.attackData) ??
      msg.getFlag('abf', 'attackData') ??
      msg.flags?.abf?.attackData ??
      null;
    if (!attackData) return ui.notifications?.warn('Datos de ataque no disponibles.');

    const targets = msg.getFlag('abf', 'targets') ?? [];
    const pendings = targets.filter(t => (t.state ?? 'pending') === 'pending');

    if (!pendings.length) return ui.notifications?.info('No hay objetivos pendientes.');

    // Resolve tokens on canvas by tokenUuid or by actorUuid
    const entries = [];
    for (const t of pendings) {
      const tok = t.tokenUuid
        ? canvas.tokens.get(t.tokenUuid)
        : t.actorUuid
        ? canvas.tokens.placeables.find(tt => tt.actor?.id === t.actorUuid)
        : null;
      const actor = tok?.actor ?? (t.actorUuid ? game.actors.get(t.actorUuid) : null);
      if (!actor) continue;

      // permission: GM or owner
      if (
        !game.user.isGM &&
        !actor.testUserPermission?.(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
      )
        continue;

      const r = await autoRollDefenseAgainstAttack({
        defenderToken: tok ?? null,
        defenderActor: actor,
        attackData
      });

      await updateAttackTargetsFlag(msg.id, {
        actorUuid: r.actor.id,
        tokenUuid: r.token?.id ?? tok?.id ?? '',
        state: 'done',
        rolledBy: game.user.id,
        defenseResult: r.defenseData.toJSON?.() ?? r.defenseData,
        updatedAt: Date.now()
      });

      entries.push(entryFromAuto(r));
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
      speaker: message.speaker, // keep same speaker context
      flags: {
        abf: {
          kind: 'multiDefenseResult',
          sourceAttackMessageId: msg.id,
          batch: { createdAt: Date.now() },
          entries: entries.map(e => ({ ...e, applied: false }))
        }
      }
    });

    const content2 = await renderTemplate(Templates.Chat.MultiDefenseResult, {
      attackLabel: game.i18n.localize?.('chat.attackData.title') ?? 'Ataque',
      entries: cm.getFlag('abf', 'entries') ?? entries,
      hasRemaining: (cm.getFlag('abf', 'entries') ?? entries).some(
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
