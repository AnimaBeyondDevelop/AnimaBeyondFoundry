export const evaluateCast = spellCasting => {
  const { i18n } = game;
  const { canCast, casted, zeon, override } = spellCasting;
  if (override.value) {
    return;
  }
  if (canCast.innate && casted.innate && canCast.prepared && casted.prepared) {
    return ui.notifications.warn(
      i18n.localize('dialogs.spellCasting.warning.mustChoose')
    );
  }
  if (canCast.innate && casted.innate) {
    return;
  } else if (!canCast.innate && casted.innate) {
    return ui.notifications.warn(
      i18n.localize('dialogs.spellCasting.warning.innateMagic')
    );
  } else if (canCast.prepared && casted.prepared) {
    return;
  } else if (!canCast.prepared && casted.prepared) {
    return ui.notifications.warn(
      i18n.localize('dialogs.spellCasting.warning.preparedSpell')
    );
  } else if (zeon.accumulated < zeon.cost) {
    return ui.notifications.warn(
      i18n.localize('dialogs.spellCasting.warning.zeonAccumulated')
    );
  } else return;
};
