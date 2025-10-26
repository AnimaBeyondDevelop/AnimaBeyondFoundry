import { autoRollDefenseAgainstAttack } from '../../module/combat/autoDefense.js';
import { Templates } from '../../module/utils/constants';
import { updateAttackTargetsFlag } from '../../utils/updateAttackTargetsFlag.js';
import { openModDialog } from '../../module/utils/dialogs/openSimpleInputDialog.js';

export default async function autoDefendActionHandler(message, _html, ds) {
  try {
    const msg = game.messages.get(ds.messageId ?? message?.id ?? null);

    // Prefer dataset; fallback to message flags
    const attackData =
      (typeof ds.attackData === 'string'
        ? safeParseJSON(ds.attackData)
        : ds.attackData) ??
      msg?.getFlag(game.animabf.id, 'attackData') ??
      msg?.flags?.animabf?.attackData ??
      null;

    if (!attackData) return ui.notifications?.warn('Datos de ataque no disponibles.');

    // Selected tokens the user can control
    const tokens = (canvas.tokens?.controlled ?? []).filter(t => canDefendWithToken(t));
    if (!tokens.length)
      return ui.notifications?.warn('No hay tokens seleccionados válidos.');

    const mod = await openModDialog();

    const entries = [];
    for (const tok of tokens) {
      // Do the auto roll (uses token if provided)
      const r = await autoRollDefenseAgainstAttack({
        defenderToken: tok,
        attackData,
        defenseMod: mod
      });

      // Update original attack message (store UUID when possible)
      if (msg?.id) {
        await updateAttackTargetsFlag(msg.id, {
          actorUuid: r.actor.id,
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
      }

      entries.push(entryFromAuto(r, tok));
    }

    // Consolidated result message (speaker: token + alias = token name)
    const tokenForSpeaker = tokens[0] ?? null;
    const tokenName =
      tokenForSpeaker?.name ??
      tokenForSpeaker?.document?.name ??
      tokens[0]?.actor?.name ??
      '';
    const speaker = tokenForSpeaker
      ? { ...ChatMessage.getSpeaker({ token: tokenForSpeaker }), alias: tokenName }
      : ChatMessage.getSpeaker({ actor: tokens[0]?.actor });

    const content = await renderTemplate(Templates.Chat.MultiDefenseResult, {
      attackLabel: attackData?.weaponId
        ? game.i18n.localize?.('chat.attackData.title') ?? 'Ataque'
        : 'Ataque',
      entries,
      hasRemaining: entries.some(e => !e.applied && e.damageFinal > 0),
      messageId: randomID()
    });

    const cm = await ChatMessage.create({
      content,
      speaker,
      flags: {
        animabf: {
          kind: 'multiDefenseResult',
          sourceAttackMessageId: msg?.id ?? null,
          batch: { createdAt: Date.now() },
          entries: entries.map(e => ({ ...e, applied: false }))
        }
      }
    });

    // Re-render with final messageId for buttons
    const content2 = await renderTemplate(Templates.Chat.MultiDefenseResult, {
      attackLabel: attackData?.weaponId
        ? game.i18n.localize?.('chat.attackData.title') ?? 'Ataque'
        : 'Ataque',
      entries: cm.getFlag(game.animabf.id, 'entries') ?? entries,
      hasRemaining: (cm.getFlag(game.animabf.id, 'entries') ?? entries).some(
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

// Build one entry of the consolidated result (prefer token name)
function entryFromAuto(r, tok) {
  return {
    actorId: r.actor.id,
    tokenId: r.token?.id ?? tok?.id ?? '',
    label: r.token?.name ?? tok?.name ?? r.actor.name,
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
