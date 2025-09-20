export async function applyMultiEntry(message, _html, ds) {
  try {
    const msg = game.messages.get(ds.messageId ?? message?.id);
    if (!msg) return ui.notifications?.warn('Mensaje no encontrado.');

    const entries = msg.getFlag(game.animabf.id, 'entries') ?? [];
    const actorId = ds.defActor ?? ds['def-actor'];
    const tokenId = ds.defToken ?? ds['def-token'];
    if (!actorId) return;

    const idx = entries.findIndex(e => e.actorId === actorId);
    const entry = idx >= 0 ? entries[idx] : null;
    if (!entry) return ui.notifications?.warn('Entrada no encontrada.');

    // amount directo o base*mult con fallback a entry.damageFinal
    let amount = Number(ds.amount ?? NaN);
    if (!(amount > 0)) {
      const base = Number.isFinite(Number(ds.base))
        ? Number(ds.base)
        : Number(entry.damageFinal ?? 0);
      const mult = Number.isFinite(Number(ds.mult)) ? Number(ds.mult) : 1;
      amount = Math.max(0, Math.round(base * mult));
    }
    if (!(amount > 0)) return ui.notifications?.warn('Sin daño que aplicar.');

    const actor = tokenId ? canvas.tokens.get(tokenId)?.actor : game.actors.get(actorId);
    if (!actor) return ui.notifications?.warn('Defensor no encontrado.');
    if (!canApply(actor))
      return ui.notifications?.warn('Sin permisos para aplicar daño.');

    // si ya se aplicó a este actor → confirm
    if (entry.applied) {
      const ok = await Dialog.confirm({
        title:
          game.i18n.localize?.('chat.result.confirmTitle') ?? '¿Aplicar daño de nuevo?',
        content: `<p>${
          game.i18n.localize?.('chat.result.confirmBody') ??
          'Este objetivo ya recibió daño de este resultado. ¿Seguro?'
        }</p>
                  <p><b>${amount}</b> ${
          game.i18n.localize?.('chat.result.points') ?? 'puntos'
        }</p>`,
        yes: () => true,
        no: () => false
      });
      if (!ok) return;
    }

    const ok = await applyDamageToActor(actor, amount);
    if (!ok) return;

    entries[idx] = { ...entry, applied: true, appliedBy: game.user.id };
    await msg.setFlag(game.animabf.id, 'entries', entries);
    ui.chat?.updateMessage?.(msg);
  } catch (e) {
    console.error(e);
    ui.notifications?.error('No se pudo aplicar el daño.');
  }
}
applyMultiEntry.action = 'animabf-apply-multi-entry';

export async function applyMultiRemaining(message, _html, ds) {
  try {
    const msg = game.messages.get(ds.messageId ?? message?.id);
    if (!msg) return ui.notifications?.warn('Mensaje no encontrado.');

    const entries = msg.getFlag(game.animabf.id, 'entries') ?? [];
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (e.applied) continue;
      const dmg = Number(e.damageFinal ?? 0);
      if (!(dmg > 0)) continue;

      const actor = e.tokenId
        ? canvas.tokens.get(e.tokenId)?.actor
        : game.actors.get(e.actorId);
      if (!actor) continue;
      if (!canApply(actor)) continue;

      const ok = await applyDamageToActor(actor, dmg);
      if (ok) entries[i] = { ...e, applied: true, appliedBy: game.user.id };
    }

    await msg.setFlag(game.animabf.id, 'entries', entries);
    ui.chat?.updateMessage?.(msg);
  } catch (e) {
    console.error(e);
    ui.notifications?.error('No se pudo aplicar el daño a los restantes.');
  }
}
applyMultiRemaining.action = 'animabf-apply-multi-remaining';

// También exporto un mapa por si tu autoloader usa 'handlers'
export const handlers = {
  'animabf-apply-multi-entry': applyMultiEntry,
  'animabf-apply-multi-remaining': applyMultiRemaining
};

function canApply(actor) {
  return (
    game.user.isGM ||
    actor.testUserPermission?.(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
  );
}

async function applyDamageToActor(actor, amount) {
  try {
    const primary = 'system.characteristics.secondaries.lifePoints.value';
    let cur = getProperty(actor, primary);
    if (typeof cur === 'number' && !Number.isNaN(cur)) {
      const next = Math.max(0, cur - amount);
      await actor.update({ [primary]: next });
      ui.notifications?.info(`${actor.name}: -${amount} LP`);
      return true;
    }
    const fallbacks = [
      'system.general.lifePoints.value',
      'system.health.value',
      'system.combat.life.value',
      'system.attributes.hp.value'
    ];
    for (const path of fallbacks) {
      cur = getProperty(actor, path);
      if (typeof cur === 'number' && !Number.isNaN(cur)) {
        const next = Math.max(0, cur - amount);
        await actor.update({ [path]: next });
        ui.notifications?.info(`${actor.name}: -${amount} LP`);
        return true;
      }
    }
    ui.notifications?.warn('No se pudo aplicar el daño: no se encontró el path de vida.');
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
}
