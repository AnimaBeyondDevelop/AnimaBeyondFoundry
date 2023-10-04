export const evaluateCast = (spellInnate, castInnate, spellPrepared, castPrepared, zeonAccumulated, zeonCost) => {
    if (spellInnate && castInnate && spellPrepared && castPrepared) { return ui.notifications.warn("Debes elegir entre Lanzar conjuro innato o Lanzar conjuro preparado")}
    else if (spellInnate && castInnate) {return}
    else if (spellPrepared && castPrepared) {return}
    else if (zeonAccumulated < zeonCost) {return ui.notifications.warn("No cuentas con suficiente zeon acumulado")}
    else return
};