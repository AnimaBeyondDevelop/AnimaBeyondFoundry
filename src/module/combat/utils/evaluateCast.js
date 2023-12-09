export const evaluateCast = spellCasting => {
  const { i18n } = game;
  const { canCast, casted, zeon, override } = spellCasting;
  if (override) {
    return false;
  }
  if (canCast.innate && casted.innate && canCast.prepared && casted.prepared) {
    ui.notifications.warn(
      i18n.localize('dialogs.spellCasting.warning.mustChoose')
    );
    return true;
  }
  if (canCast.innate && casted.innate) {
    return;
  } else if (!canCast.innate && casted.innate) {
    ui.notifications.warn(
      i18n.localize('dialogs.spellCasting.warning.innateMagic')
    );
    return true;
  } else if (canCast.prepared && casted.prepared) {
    return false;
  } else if (!canCast.prepared && casted.prepared) {
    return ui.notifications.warn(
      i18n.localize('dialogs.spellCasting.warning.preparedSpell')
    );
  } else if (zeon.accumulated < zeon.cost) {
    ui.notifications.warn(
      i18n.localize('dialogs.spellCasting.warning.zeonAccumulated')
    );
    return true;
  } else return false;
};
