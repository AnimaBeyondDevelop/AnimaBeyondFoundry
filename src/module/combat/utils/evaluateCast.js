export const evaluateCast = (spellCasting, zeonCost) => {
    if (spellCasting.spell.innate && spellCasting.cast.innate && spellCasting.spell.prepared && spellCasting.cast.prepared) { return ui.notifications.warn("Debes elegir entre Lanzar conjuro innato o Lanzar conjuro preparado")}
    if (spellCasting.spell.innate && spellCasting.cast.innate) {return}
    else if (!spellCasting.spell.innate && spellCasting.cast.innate) {return ui.notifications.warn("No cuentas con suficiente Magia Innata")}
    else if (spellCasting.spell.prepared && spellCasting.cast.prepared) {return}
    else if (!spellCasting.spell.prepared && spellCasting.cast.prepared) {return ui.notifications.warn("No tienes este Conjuro Preparado")}
    else if (spellCasting.zeonAccumulated < zeonCost) {return ui.notifications.warn("No cuentas con suficiente Zeon Acumulado")}
    else return
};