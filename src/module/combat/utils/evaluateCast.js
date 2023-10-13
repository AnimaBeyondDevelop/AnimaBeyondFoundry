export const evaluateCast = (spellInnate, castInnate, spellPrepared, castPrepared, zeonAccumulated, zeonCost) => {
    if (spellInnate && castInnate && spellPrepared && castPrepared) { return ui.notifications.warn("Debes elegir entre Lanzar conjuro innato o Lanzar conjuro preparado")}
    if (spellInnate && castInnate) {return}
    else if (!spellInnate && castInnate) {return ui.notifications.warn("No cuentas con suficiente Magia Innata")}
    else if (spellPrepared && castPrepared) {return}
    else if (!spellPrepared && castPrepared) {return ui.notifications.warn("No tienes este Conjuro Preparado")}
    else if (zeonAccumulated < zeonCost) {return ui.notifications.warn("No cuentas con suficiente Zeon Acumulado")}
    else return
};