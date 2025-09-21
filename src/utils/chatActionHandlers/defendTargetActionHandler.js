import { DefenseConfigurationDialog } from '../../module/dialogs/DefenseConfigurationDialog';

async function defendTargetActionHandler(message, _html, dataset) {
  try {
    const messageId = dataset.messageId ?? message?.id;
    const msg = game.messages.get(messageId);
    if (!msg) return ui.notifications?.warn('Mensaje no encontrado.');

    const atk =
      msg.getFlag(game.animabf.id, 'attackData') ?? msg.flags?.animabf?.attackData;
    if (!atk) return ui.notifications?.warn('Datos de ataque no disponibles.');

    // Resolve defender token from dataset
    const targetTokenId = dataset.targetToken ?? dataset['target-token'] ?? '';
    const targetActorId =
      dataset.targetActor ?? dataset['target-actor'] ?? dataset.target ?? '';

    let defenderToken = targetTokenId ? canvas.tokens.get(targetTokenId) : null;
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

    // Resolve attacker token (optional)
    let attackerToken = message?.speaker?.token
      ? canvas.tokens.get(message.speaker.token)
      : null;
    if (!attackerToken && atk.attackerId) {
      attackerToken =
        canvas.tokens.placeables.find(t => t.actor?.id === atk.attackerId) ?? null;
    }

    // Do NOT claim here. The dialog will claim only if initial state is 'pending'.
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
