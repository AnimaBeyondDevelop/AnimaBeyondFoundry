export const evaluateCast = spellCasting => {
  const { spell, cast, zeon, override } = spellCasting;
  if (override.value) {
    return;
  }
  if (spell.innate && cast.innate && spell.prepared && cast.prepared) {
    return ui.notifications.warn(
      'Debes elegir entre Lanzar conjuro innato o Lanzar conjuro preparado'
    );
  }
  if (spell.innate && cast.innate) {
    return;
  } else if (!spell.innate && cast.innate) {
    return ui.notifications.warn('No cuentas con suficiente Magia Innata');
  } else if (spell.prepared && cast.prepared) {
    return;
  } else if (!spell.prepared && cast.prepared) {
    return ui.notifications.warn('No tienes este Conjuro Preparado');
  } else if (zeon.accumulated < zeon.cost) {
    return ui.notifications.warn('No cuentas con suficiente Zeon Acumulado');
  } else return;
};
