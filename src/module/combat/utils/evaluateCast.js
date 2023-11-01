export const evaluateCast = spellCasting => {
  const { canCast, casted, zeon, override } = spellCasting;
  if (override.value) {
    return;
  }
  if (canCast.innate && casted.innate && canCast.prepared && casted.prepared) {
    return ui.notifications.warn(
      'Debes elegir entre Lanzar conjuro innato o Lanzar conjuro preparado'
    );
  }
  if (canCast.innate && casted.innate) {
    return;
  } else if (!canCast.innate && casted.innate) {
    return ui.notifications.warn('No cuentas con suficiente Magia Innata');
  } else if (canCast.prepared && casted.prepared) {
    return;
  } else if (!canCast.prepared && casted.prepared) {
    return ui.notifications.warn('No tienes este Conjuro Preparado');
  } else if (zeon.accumulated < zeon.cost) {
    return ui.notifications.warn('No cuentas con suficiente Zeon Acumulado');
  } else return;
};
