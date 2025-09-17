export default async function applyDamageActionHandler(message, _html, ds) {
  try {
    const msg = game.messages.get(ds.messageId ?? message.id);
    if (!msg) return ui.notifications?.warn('Mensaje no encontrado.');

    const abf = msg.flags?.abf ?? {};
    const base = Number(ds.base ?? abf.result?.damageFinal ?? 0);
    if (!(base > 0)) return ui.notifications?.warn('Sin daño que aplicar.');

    const mult = Number(ds.mult ?? 1);
    const amount = Math.max(0, Math.round(base * mult));

    // Resolve defender
    const tokenId = ds.defToken ?? ds['def-token'] ?? abf.defender?.tokenId ?? '';
    const actorId = ds.defActor ?? ds['def-actor'] ?? abf.defender?.actorId ?? '';
    let token = tokenId ? canvas.tokens.get(tokenId) : null;
    let actor = token?.actor ?? (actorId ? game.actors.get(actorId) : null);
    if (!actor) return ui.notifications?.warn('Defensor no encontrado.');

    // Permissions
    const canApply =
      game.user.isGM ||
      actor.testUserPermission?.(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
    if (!canApply) return ui.notifications?.warn('Sin permisos para aplicar daño.');

    // Confirm only if already applied at least once
    const appliedOnce = !!abf.damageControl?.appliedOnce;
    if (appliedOnce) {
      const ok = await Dialog.confirm({
        title:
          game.i18n.localize?.('chat.result.confirmTitle') ?? '¿Aplicar daño de nuevo?',
        content: `<p>${
          game.i18n.localize?.('chat.result.confirmBody') ??
          'Este resultado ya aplicó daño antes. ¿Seguro?'
        }</p><p><b>${amount}</b> ${
          game.i18n.localize?.('chat.result.points') ?? 'puntos'
        }</p>`,
        yes: () => true,
        no: () => false
      });
      if (!ok) return;
    }

    // Apply damage
    const applied = await applyDamageToActor(actor, amount);
    if (!applied) return;

    // Update flags (mark as applied once and log)
    const apps = Array.isArray(abf.damageControl?.apps)
      ? [...abf.damageControl.apps]
      : [];
    apps.push({ ts: Date.now(), by: game.user.id, amount, mult, actorId: actor.id });
    await msg.setFlag('abf', 'damageControl', { appliedOnce: true, apps });
    ui.chat?.updateMessage?.(msg);
  } catch (err) {
    console.error(err);
    ui.notifications?.error('No se pudo aplicar el daño.');
  }
}

export const action = 'abf-apply-damage';

/**
 * Apply damage to the actor sheet.
 * Uses the template path: system.characteristics.secondaries.lifePoints.value
 * Falls back to a few legacy/common paths if the main one is missing.
 */
async function applyDamageToActor(actor, amount) {
  try {
    const primaryPath = 'system.characteristics.secondaries.lifePoints.value'; // from template
    let cur = getProperty(actor, primaryPath);
    if (typeof cur === 'number' && !Number.isNaN(cur)) {
      const next = Math.max(0, cur - amount);
      await actor.update({ [primaryPath]: next });
      ui.notifications?.info(`${actor.name}: -${amount} LP`);
      return { path: primaryPath, from: cur, to: next };
    }

    // Fallbacks (for migrated/old data)
    const candidates = [
      'system.general.lifePoints.value',
      'system.health.value',
      'system.combat.life.value',
      'system.attributes.hp.value'
    ];
    for (const path of candidates) {
      cur = getProperty(actor, path);
      if (typeof cur === 'number' && !Number.isNaN(cur)) {
        const next = Math.max(0, cur - amount);
        await actor.update({ [path]: next });
        ui.notifications?.info(`${actor.name}: -${amount} LP`);
        return { path, from: cur, to: next };
      }
    }

    ui.notifications?.warn(
      'No se pudo aplicar el daño: no se encontró el path de vida en este actor.'
    );
    console.warn('[ABF] HP path not found on actor', actor);
    return null;
  } catch (e) {
    console.error(e);
    ui.notifications?.error('Fallo aplicando daño al actor.');
    return null;
  }
}
